"use client";

import React from "react";
import { MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { useEmbeddedSignup } from "@/hooks/useEmbeddedSignup";
import { EmbeddedSignupModal } from "@/components/settings/EmbeddedSignupModal";

interface EmbeddedSignupButtonProps {
  onSuccess?: (phoneNumber: string) => void;
}

export function EmbeddedSignupButton({ onSuccess }: EmbeddedSignupButtonProps) {
  const {
    isConnecting,
    isWizardOpen,
    setIsWizardOpen,
    error,
    triggerEmbeddedSignup,
  } = useEmbeddedSignup({ onSuccess });

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          onClick={triggerEmbeddedSignup}
          disabled={isConnecting}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#25D366]/25 hover:shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Connecting WhatsApp...</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Connect WhatsApp Line (1-Click)</span>
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
            </>
          )}
        </button>

        {error && (
          <p className="text-[11px] text-rose-600 font-medium">
            {error}
          </p>
        )}
      </div>

      <EmbeddedSignupModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={(phone) => {
          if (onSuccess) onSuccess(phone);
        }}
      />
    </>
  );
}
