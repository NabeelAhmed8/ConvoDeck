"use client";

import React, { useState } from "react";
import { Send, X, Loader2, Sparkles } from "lucide-react";
import { sendMetaTestMessage } from "@/actions/metaCloudApiActions";
import { toast } from "@/store/useToastStore";

interface MetaSendTestModalProps {
  isOpen: boolean;
  phoneNumberId: string;
  accessToken: string;
  onClose: () => void;
}

export function MetaSendTestModal({
  isOpen,
  phoneNumberId,
  accessToken,
  onClose,
}: MetaSendTestModalProps) {
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) {
      toast.error("Phone Number Required", "Enter the phone number with country code (e.g. 923001234567).");
      return;
    }

    setSending(true);

    const res = await sendMetaTestMessage({
      recipientPhone: recipient.trim(),
      phoneNumberId,
      accessToken,
    });

    setSending(false);

    if (res.success) {
      toast.success(
        "Test Message Delivered! 🚀",
        `WhatsApp test message was sent to +${recipient.replace(/\D/g, "")}. Check your phone!`
      );
      onClose();
    } else {
      toast.error("Delivery Failed", res.error || "Meta rejected message dispatch.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-auto animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Send WhatsApp Test Message</h3>
              <p className="text-[11px] text-slate-500">Confirm live message dispatch through Meta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recipient Phone Number (with Country Code)
            </label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. 923001234567"
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Enter your own personal WhatsApp number to receive the test message.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Send Test Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
