"use client";

import React, { useState } from "react";
import { Copy, Check, Globe, Shield } from "lucide-react";
import { toast } from "@/store/useToastStore";

interface WebhookCardProps {
  webhookToken: string;
}

export function WebhookCard({ webhookToken }: WebhookCardProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhook/whatsapp`
      : "/api/webhook/whatsapp";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    toast.success("Webhook URL Copied", "Paste this in Meta App Dashboard > WhatsApp > Configuration.");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(webhookToken);
    setCopiedToken(true);
    toast.success("Verify Token Copied", "Paste this as the 'Verify Token' in Meta App Dashboard.");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-[#ea5414]" />
        <span className="text-xs font-bold text-slate-800">
          Meta WhatsApp Webhook Configuration
        </span>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Paste these two fields into your <strong>Meta for Developers &gt; WhatsApp &gt; Configuration</strong> to receive incoming messages in real-time.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Callback URL */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Callback URL
            </span>
            <span className="text-xs font-mono text-slate-800 truncate block">
              {webhookUrl}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyUrl}
            title="Copy Callback URL"
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#ea5414] hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Verify Token */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Verify Token
            </span>
            <span className="text-xs font-mono text-slate-800 truncate block">
              {webhookToken}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyToken}
            title="Copy Verify Token"
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#ea5414] hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
