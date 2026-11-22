"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Sparkles,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Zap,
  ArrowRight,
} from "lucide-react";
import { loadFacebookSdk } from "@/lib/facebookSdk";
import { completeEmbeddedSignup } from "@/actions/embeddedSignupActions";
import { toast } from "@/store/useToastStore";

interface EmbeddedSignupCardProps {
  currentPhoneNumber?: string;
  onConnected?: (phoneNumber: string) => void;
}

export function EmbeddedSignupCard({
  onConnected,
}: EmbeddedSignupCardProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [showSetupNotice, setShowSetupNotice] = useState(false);

  const eventDataRef = useRef<{
    phoneNumberId?: string;
    wabaId?: string;
  }>({});

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";
  const configId = process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID || "";

  // Listen to Meta's window message event during Embedded Signup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

      try {
        const raw = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (raw && (raw.type === "WA_EMBEDDED_SIGNUP" || raw.event === "FINISH")) {
          const data = raw.data || {};
          if (data.phone_number_id || data.phoneNumberId) {
            eventDataRef.current.phoneNumberId = data.phone_number_id || data.phoneNumberId;
          }
          if (data.waba_id || data.wabaId) {
            eventDataRef.current.wabaId = data.waba_id || data.wabaId;
          }
        }
      } catch {
        // Safe ignore
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleLaunchPopup = async () => {
    setError("");

    if (!appId || !configId) {
      setShowSetupNotice(true);
      return;
    }

    setConnecting(true);

    try {
      const FB = await loadFacebookSdk(appId);
      if (!FB) {
        setConnecting(false);
        setError("Unable to load Facebook SDK. Please check your internet connection.");
        return;
      }

      FB.login(
        async (response) => {
          if (response?.authResponse?.code) {
            const code = response.authResponse.code;
            const res = await completeEmbeddedSignup({
              code,
              phoneNumberId: eventDataRef.current.phoneNumberId,
              wabaId: eventDataRef.current.wabaId,
            });

            setConnecting(false);

            if (res.success) {
              toast.success(
                "WhatsApp Connected! 🎉",
                `Your official business line ${res.phoneNumber || ""} is now live on ConvoDeck.`
              );
              if (onConnected && res.phoneNumber) {
                onConnected(res.phoneNumber);
              }
            } else {
              setError(res.error || "Failed to finalize WhatsApp connection.");
              toast.error("Connection Failed", res.error || "Please try again.");
            }
          } else {
            setConnecting(false);
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
      setConnecting(false);
      const msg = err instanceof Error ? err.message : "Error launching Facebook Login";
      setError(msg);
    }
  };

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-500/20 space-y-5 min-w-0 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 min-w-0">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-[#25D366]/30 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">
                Automatic WhatsApp Connection (1-Click)
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Zero Technical Setup
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Log in with Facebook in a secure popup. Meta automatically links your WhatsApp Business account and registers webhook listeners for all team agents. No code or tokens required.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleLaunchPopup}
            disabled={connecting}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-xs shadow-md shadow-[#25D366]/25 hover:shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Connecting Line...</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 text-white" />
                <span>Log in with Facebook</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Step Visual Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 space-y-1">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center">
            1
          </span>
          <span className="text-xs font-bold text-slate-800 block">Click Facebook Login</span>
          <span className="text-[11px] text-slate-500 block leading-tight">
            A verified Meta popup opens directly in your browser.
          </span>
        </div>

        <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 space-y-1">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center">
            2
          </span>
          <span className="text-xs font-bold text-slate-800 block">Select WhatsApp Number</span>
          <span className="text-[11px] text-slate-500 block leading-tight">
            Choose your existing business line or add a new one.
          </span>
        </div>

        <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 space-y-1">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center">
            3
          </span>
          <span className="text-xs font-bold text-slate-800 block">Instant Live Sync</span>
          <span className="text-[11px] text-slate-500 block leading-tight">
            Incoming &amp; outgoing messages sync with all team agents.
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Setup Guide Notice if App ID or Config ID is missing in .env */}
      {showSetupNotice && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Meta Embedded Signup Configuration Needed</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            To enable the automatic 1-click Facebook popup for your users, add these 3 variables to your <code>.env.local</code> file (from Meta App Dashboard &gt; WhatsApp &gt; Quickstart):
          </p>
          <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 font-mono text-[11px] space-y-1 text-slate-800 select-all overflow-x-auto">
            <div>NEXT_PUBLIC_FACEBOOK_APP_ID=your_meta_app_id</div>
            <div>FACEBOOK_APP_SECRET=your_meta_app_secret</div>
            <div>NEXT_PUBLIC_FACEBOOK_CONFIG_ID=your_embedded_signup_config_id</div>
          </div>
        </div>
      )}

      {/* Feature Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/70 border border-slate-200/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Automatic Webhook Routing</span>
        </div>
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/70 border border-slate-200/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Official Meta Cloud API • Zero Ban Risk</span>
        </div>
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/70 border border-slate-200/60">
          <Sparkles className="w-3.5 h-3.5 text-[#ff6422] shrink-0" />
          <span className="truncate">Green Checkmark Eligible</span>
        </div>
      </div>
    </div>
  );
}
