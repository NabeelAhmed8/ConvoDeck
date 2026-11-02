"use client";

import React, { useState } from "react";
import { Phone, CheckCircle2, ShieldCheck, Unlink } from "lucide-react";
import { disconnectWhatsAppLine } from "@/actions/embeddedSignupActions";
import { toast } from "@/store/useToastStore";
import { DisconnectLineModal } from "@/components/settings/DisconnectLineModal";

interface ConnectedLineCardProps {
  phoneNumber: string;
  onDisconnected?: () => void;
}

export function ConnectedLineCard({
  phoneNumber,
  onDisconnected,
}: ConnectedLineCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConfirmDisconnect = async () => {
    setIsDisconnecting(true);
    const res = await disconnectWhatsAppLine();
    setIsDisconnecting(false);
    setIsModalOpen(false);

    if (res.success) {
      toast.success(
        "WhatsApp Line Disconnected",
        "Your WhatsApp business line has been disconnected successfully."
      );
      if (onDisconnected) onDisconnected();
    } else {
      toast.error(
        "Disconnect Failed",
        res.error || "Unable to disconnect line. Please try again."
      );
    }
  };

  return (
    <>
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
                Connected &amp; Live
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
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
        >
          <Unlink className="w-3.5 h-3.5" />
          Disconnect Line
        </button>
      </div>

      <DisconnectLineModal
        isOpen={isModalOpen}
        phoneNumber={phoneNumber}
        isDisconnecting={isDisconnecting}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDisconnect}
      />
    </>
  );
}
