"use client";

import React, { useState } from "react";
import { Phone, CheckCircle2, ShieldCheck, Unlink, Loader2 } from "lucide-react";
import { disconnectWhatsAppLine } from "@/actions/embeddedSignupActions";
import { toast } from "@/store/useToastStore";

interface ConnectedLineCardProps {
  phoneNumber: string;
  onDisconnected?: () => void;
}

export function ConnectedLineCard({
  phoneNumber,
  onDisconnected,
}: ConnectedLineCardProps) {
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect this WhatsApp line? Your agents will not be able to send or receive messages until reconnected.")) {
      return;
    }

    setDisconnecting(true);
    const res = await disconnectWhatsAppLine();
    setDisconnecting(false);

    if (res.success) {
      toast.success("Line Disconnected", "WhatsApp Business line has been disconnected.");
      if (onDisconnected) onDisconnected();
    } else {
      toast.error("Disconnect Failed", res.error || "Unable to disconnect line.");
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 text-emerald-600">
          <Phone className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-sm sm:text-base text-slate-900">
              {phoneNumber}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Connected & Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Active across all multi-agent seats. Incoming &amp; outgoing messages live.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDisconnect}
        disabled={disconnecting}
        className="px-4 py-2 text-xs font-semibold rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
      >
        {disconnecting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Disconnecting...
          </>
        ) : (
          <>
            <Unlink className="w-3.5 h-3.5" />
            Disconnect Line
          </>
        )}
      </button>
    </div>
  );
}
