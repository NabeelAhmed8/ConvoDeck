"use client";

import React, { useState } from "react";
import { MessageSquare, X, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { completeEmbeddedSignup } from "@/actions/embeddedSignupActions";
import { toast } from "@/store/useToastStore";
import { NeumorphicAutocompleteInput } from "@/components/ui/NeumorphicAutocompleteInput";

interface EmbeddedSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phoneNumber: string) => void;
}

export function EmbeddedSignupModal({
  isOpen,
  onClose,
  onSuccess,
}: EmbeddedSignupModalProps) {
  const [phone, setPhone] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Phone Number Required", "Please enter your WhatsApp business phone number.");
      return;
    }

    setLoading(true);

    const res = await completeEmbeddedSignup({
      displayPhoneNumber: phone.trim(),
      phoneNumberId: phoneNumberId.trim(),
      accessToken: accessToken.trim(),
    });

    setLoading(false);

    if (res.success) {
      toast.success("WhatsApp Connected 🎉", `Line ${phone} is now linked to your workspace.`);
      onSuccess(phone);
      onClose();
    } else {
      toast.error("Connection Failed", res.error || "Unable to link phone number.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-auto animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center border border-[#25D366]/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connect WhatsApp Business
              </h3>
              <p className="text-xs text-slate-500">
                1-Click Fast Connect for your multi-agent workstation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <NeumorphicAutocompleteInput
              id="embedded-whatsapp-phone"
              name="whatsappPhoneNumber"
              type="tel"
              label="WhatsApp Business Phone Number"
              required
              value={phone}
              onChange={setPhone}
              placeholder="e.g. +1 555 123 4567"
              autoComplete="tel"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The phone number registered with your Meta WhatsApp account.
            </p>
          </div>

          <div>
            <NeumorphicAutocompleteInput
              id="embedded-phone-id"
              name="phoneNumberId"
              type="text"
              label="Meta Phone Number ID (Optional for direct API)"
              value={phoneNumberId}
              onChange={setPhoneNumberId}
              placeholder="e.g. 108492019482910"
            />
          </div>

          <div>
            <label htmlFor="embedded-access-token" className="block text-xs font-semibold text-slate-700 mb-1">
              System User / Access Token <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="embedded-access-token"
              name="accessToken"
              type="password"
              autoComplete="current-password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAGm0PX4ZC..."
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#25D366] text-white hover:bg-[#20ba59] shadow-md shadow-[#25D366]/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? "Connecting Line..." : "Link WhatsApp Line"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
