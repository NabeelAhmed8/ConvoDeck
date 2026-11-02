"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { loadFacebookSdk } from "@/lib/facebookSdk";
import { completeEmbeddedSignup } from "@/actions/embeddedSignupActions";
import { IEmbeddedSignupMessageEvent, IFacebookLoginResponse } from "@/types/embeddedSignup";
import { toast } from "@/store/useToastStore";

interface UseEmbeddedSignupProps {
  onSuccess?: (phoneNumber: string) => void;
}

export function useEmbeddedSignup({ onSuccess }: UseEmbeddedSignupProps = {}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventDataRef = useRef<{ phoneNumberId?: string; wabaId?: string }>({});

  // Listen for Meta Embedded Signup message events sent from the popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin from facebook.com
      if (!event.origin.includes("facebook.com")) return;

      try {
        const payload: IEmbeddedSignupMessageEvent =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (payload?.type === "WA_EMBEDDED_SIGNUP") {
          if (payload.event === "FINISH" && payload.data) {
            eventDataRef.current = {
              phoneNumberId: payload.data.phone_number_id,
              wabaId: payload.data.waba_id,
            };
          } else if (payload.event === "CANCEL") {
            setIsConnecting(false);
            toast.info("Setup Cancelled", "WhatsApp connection popup was closed.");
          } else if (payload.event === "ERROR") {
            setIsConnecting(false);
            setError(payload.error_message || "An error occurred during Meta signup.");
            toast.error("Meta Setup Error", payload.error_message || "Setup failed.");
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const triggerEmbeddedSignup = useCallback(async () => {
    setError(null);
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";

    // If Meta App ID is not yet configured in environment, open clean fast-connect wizard
    if (!appId) {
      setIsWizardOpen(true);
      return;
    }

    setIsConnecting(true);

    try {
      const FB = await loadFacebookSdk(appId);
      if (!FB) {
        setIsConnecting(false);
        setIsWizardOpen(true);
        return;
      }

      const configId = process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID || undefined;

      FB.login(
        async (response: unknown) => {
          const fbResponse = response as IFacebookLoginResponse;

          if (fbResponse.authResponse) {
            const code = fbResponse.authResponse.code;
            const accessToken = fbResponse.authResponse.accessToken;

            const result = await completeEmbeddedSignup({
              code,
              accessToken,
              phoneNumberId: eventDataRef.current.phoneNumberId,
              wabaId: eventDataRef.current.wabaId,
            });

            setIsConnecting(false);

            if (result.success) {
              toast.success("WhatsApp Connected 🎉", `Business line is now live: ${result.phoneNumber || "Verified"}`);
              if (onSuccess) onSuccess(result.phoneNumber || "");
            } else {
              setError(result.error || "Failed to finalize WhatsApp connection.");
              toast.error("Connection Failed", result.error || "Please verify credentials.");
            }
          } else {
            setIsConnecting(false);
          }
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            feature: "whatsapp_embedded_signup",
            version: 2,
          },
        }
      );
    } catch (err: unknown) {
      setIsConnecting(false);
      const msg = err instanceof Error ? err.message : "Failed to launch Facebook login";
      setError(msg);
      // Fallback to guided modal
      setIsWizardOpen(true);
    }
  }, [onSuccess]);

  return {
    isConnecting,
    isWizardOpen,
    setIsWizardOpen,
    error,
    triggerEmbeddedSignup,
  };
}
