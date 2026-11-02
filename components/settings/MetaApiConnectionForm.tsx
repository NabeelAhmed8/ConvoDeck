"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Send,
  Sparkles,
} from "lucide-react";
import { verifyMetaCredentials, saveMetaApiConfig } from "@/actions/metaCloudApiActions";
import { toast } from "@/store/useToastStore";
import { MetaSetupGuideModal } from "@/components/settings/MetaSetupGuideModal";
import { MetaSendTestModal } from "@/components/settings/MetaSendTestModal";

interface MetaApiConnectionFormProps {
  initialPhone: string;
  initialPhoneId: string;
  initialWabaId: string;
  initialToken: string;
  webhookToken: string;
  onSaved: (data: {
    phoneNumber: string;
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
  }) => void;
}

export function MetaApiConnectionForm({
  initialPhone,
  initialPhoneId,
  initialWabaId,
  initialToken,
  webhookToken,
  onSaved,
}: MetaApiConnectionFormProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [phoneId, setPhoneId] = useState(initialPhoneId);
  const [wabaId, setWabaId] = useState(initialWabaId);
  const [token, setToken] = useState(initialToken);

  // Sync internal state when parent loads or resets (e.g. 0-meter disconnect)
  useEffect(() => {
    setPhone(initialPhone || "");
    setPhoneId(initialPhoneId || "");
    setWabaId(initialWabaId || "");
    setToken(initialToken || "");
    if (!initialPhone) {
      setVerifiedInfo(null);
    }
  }, [initialPhone, initialPhoneId, initialWabaId, initialToken]);

  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifiedInfo, setVerifiedInfo] = useState<{
    name: string;
    phone: string;
    rating: string;
  } | null>(null);

  const [showGuide, setShowGuide] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const handleVerify = async () => {
    if (!phoneId.trim() || !token.trim()) {
      toast.error("Credentials Required", "Enter both Phone Number ID and Access Token to verify.");
      return;
    }

    setVerifying(true);
    setVerifiedInfo(null);

    const res = await verifyMetaCredentials({
      phoneNumberId: phoneId.trim(),
      accessToken: token.trim(),
    });

    setVerifying(false);

    if (res.success) {
      setVerifiedInfo({
        name: res.verifiedName || "Official WhatsApp Business",
        phone: res.displayPhoneNumber || phone,
        rating: res.qualityRating || "GREEN",
      });
      if (res.displayPhoneNumber && !phone) {
        setPhone(res.displayPhoneNumber);
      }
      toast.success("Meta Verified! 🎉", `Connected to ${res.verifiedName || "WhatsApp Business"}.`);
    } else {
      toast.error("Meta Verification Failed", res.error || "Please check credentials.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await saveMetaApiConfig({
      whatsappPhoneNumber: phone.trim(),
      whatsappPhoneNumberId: phoneId.trim(),
      whatsappBusinessAccountId: wabaId.trim(),
      whatsappAccessToken: token.trim(),
      webhookVerifyToken: webhookToken,
    });

    setSaving(false);

    if (res.success) {
      toast.success("Configuration Saved", "Meta Cloud API credentials are active.");
      onSaved({
        phoneNumber: phone.trim(),
        phoneNumberId: phoneId.trim(),
        wabaId: wabaId.trim(),
        accessToken: token.trim(),
      });
    } else {
      toast.error("Save Failed", res.error || "Unable to save credentials.");
    }
  };

  return (
    <>
      <form onSubmit={handleSave} className="space-y-4">
        {/* Verification Status Banner if verified */}
        {verifiedInfo && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Meta Verified: {verifiedInfo.name}
                </span>
                <span className="text-[11px] text-emerald-700">
                  Number: {verifiedInfo.phone} • Quality: {verifiedInfo.rating}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTestModal(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              Send Test Message
            </button>
          </div>
        )}

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Connected WhatsApp Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555 123 4567"
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meta Phone Number ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={phoneId}
              onChange={(e) => setPhoneId(e.target.value)}
              placeholder="e.g. 108492019482910"
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Business Account ID (WABA)
            </label>
            <input
              type="text"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              placeholder="e.g. 293847561029384"
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                System User Access Token <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3 h-3" /> Setup Guide
              </button>
            </div>
            <input
              type="password"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="EAAGm0PX4ZC..."
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Verifying with Meta...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Test &amp; Verify Credentials
                </>
              )}
            </button>

            {phoneId && token && !verifying && (
              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Send Test
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-bold rounded-xl neu-btn-primary text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving Configuration..." : "Save Meta Cloud API"}
          </button>
        </div>
      </form>

      {/* Guide Modal */}
      <MetaSetupGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />

      {/* Send Test Modal */}
      <MetaSendTestModal
        isOpen={showTestModal}
        phoneNumberId={phoneId}
        accessToken={token}
        onClose={() => setShowTestModal(false)}
      />
    </>
  );
}
