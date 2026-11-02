"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Save, ShieldCheck } from "lucide-react";
import { updateWorkspaceSettings } from "@/actions/workspaceActions";
import { toast } from "@/store/useToastStore";

interface ManualConfigAccordionProps {
  name: string;
  phoneNumber: string;
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  webhookToken: string;
  onSaved: (data: {
    phoneNumber: string;
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
  }) => void;
}

export function ManualConfigAccordion({
  name,
  phoneNumber: initialPhone,
  phoneNumberId: initialPhoneId,
  wabaId: initialWabaId,
  accessToken: initialToken,
  webhookToken: initialWebhook,
  onSaved,
}: ManualConfigAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneId, setPhoneId] = useState(initialPhoneId);
  const [waba, setWaba] = useState(initialWabaId);
  const [token, setToken] = useState(initialToken);
  const [webhook, setWebhook] = useState(initialWebhook);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhook/whatsapp`
      : "/api/webhook/whatsapp";

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("Copied", "Webhook URL copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await updateWorkspaceSettings({
      name,
      whatsappPhoneNumber: phone,
      whatsappPhoneNumberId: phoneId,
      whatsappBusinessAccountId: waba,
      whatsappAccessToken: token,
      webhookVerifyToken: webhook,
    });

    setSaving(false);

    if (res.success) {
      toast.success("Settings Saved", "Manual WhatsApp credentials updated successfully.");
      onSaved({
        phoneNumber: phone,
        phoneNumberId: phoneId,
        wabaId: waba,
        accessToken: token,
      });
    } else {
      toast.error("Save Failed", res.error || "Unable to save credentials.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white/70">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
      >
        <div>
          <span className="text-xs font-bold text-slate-800 block">
            Advanced Developer Credentials (Manual Configuration)
          </span>
          <span className="text-[11px] text-slate-500">
            For power users who wish to manually manage System Access Tokens &amp; Meta IDs.
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </button>

      {isOpen && (
        <form onSubmit={handleSave} className="p-4 sm:p-5 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full px-3.5 py-2 text-xs neu-input rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Phone Number ID
              </label>
              <input
                type="text"
                value={phoneId}
                onChange={(e) => setPhoneId(e.target.value)}
                placeholder="108492019482910"
                className="w-full px-3.5 py-2 text-xs neu-input rounded-xl text-slate-900"
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
                value={waba}
                onChange={(e) => setWaba(e.target.value)}
                placeholder="293847561029384"
                className="w-full px-3.5 py-2 text-xs neu-input rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Webhook Verification Token
              </label>
              <input
                type="text"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                placeholder="convodeck_secure_token"
                className="w-full px-3.5 py-2 text-xs neu-input rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              System User Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="EAAGm0PX4ZC..."
              className="w-full px-3.5 py-2 text-xs neu-input rounded-xl text-slate-900"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-700 block">Webhook Callback URL:</span>
              <span className="text-[11px] font-mono text-slate-500 truncate block">{webhookUrl}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy URL"}
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold rounded-xl neu-btn-primary text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Credentials"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
