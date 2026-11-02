"use client";

import React from "react";
import { AlertTriangle, X, Loader2, Unlink } from "lucide-react";

interface DisconnectLineModalProps {
  isOpen: boolean;
  phoneNumber: string;
  isDisconnecting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DisconnectLineModal({
  isOpen,
  phoneNumber,
  isDisconnecting,
  onClose,
  onConfirm,
}: DisconnectLineModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-auto animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>

          <button
            onClick={onClose}
            disabled={isDisconnecting}
            aria-label="Close dialog"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3
          id="disconnect-modal-title"
          className="text-base font-bold text-slate-900 mb-1"
        >
          Disconnect WhatsApp Line?
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-5">
          Are you sure you want to disconnect{" "}
          <strong className="font-mono text-slate-900">{phoneNumber}</strong>?
          Your agents will not be able to send or receive WhatsApp messages until
          a line is reconnected.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDisconnecting}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDisconnecting}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <Unlink className="w-3.5 h-3.5" />
                Yes, Disconnect Line
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
