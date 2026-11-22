"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  QrCode,
  ShieldCheck,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  Lock,
  Zap,
  Info,
  Sliders,
} from "lucide-react";
import {
  generateQrCodeSession,
  confirmQrDeviceConnection,
} from "@/actions/qrConnectActions";
import { toast } from "@/store/useToastStore";

interface WhatsAppQrConnectCardProps {
  onConnected?: (phoneNumber: string) => void;
}

export function WhatsAppQrConnectCard({
  onConnected,
}: WhatsAppQrConnectCardProps) {
  const [qrSvg, setQrSvg] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>("+1 (555) 019-2834");
  const [showSimulateInput, setShowSimulateInput] = useState<boolean>(false);

  // Load new QR Session
  const fetchNewQrSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await generateQrCodeSession();
      if (res.success && res.qrSvg && res.sessionId) {
        setQrSvg(res.qrSvg);
        setSessionId(res.sessionId);
        setTimeLeft(60);
      } else {
        toast.error("QR Code Error", res.error || "Unable to generate pairing QR code.");
      }
    } catch {
      toast.error("Network Error", "Could not reach the pairing server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewQrSession();
  }, [fetchNewQrSession]);

  // Countdown timer for 60s QR code validity
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Handle instant pairing simulation / confirmation
  const handleConfirmPairing = async (phoneToUse?: string) => {
    if (!sessionId) return;
    setIsLinking(true);
    try {
      const chosenPhone = phoneToUse || testPhoneNumber;
      const res = await confirmQrDeviceConnection({
        phoneNumber: chosenPhone,
        sessionId,
      });

      if (res.success && res.phoneNumber) {
        toast.success(
          "WhatsApp Linked Successfully! 🛡️",
          `Connected as ${res.phoneNumber} with Anti-Ban Shield Active.`
        );
        if (onConnected) {
          onConnected(res.phoneNumber);
        }
      } else {
        toast.error("Connection Failed", res.error || "Could not link WhatsApp device.");
      }
    } catch {
      toast.error("Error", "Pairing confirmation encountered an unexpected error.");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/80 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Top Banner: Header & Anti-Ban Highlights */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Link WhatsApp via Secure QR Code
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              Anti-Ban Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zero complicated Meta Developer setup. Scan with your phone like WhatsApp Web.
          </p>
        </div>

        {/* Security Trust Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[11px] font-medium text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Anti-Spam Filter</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[11px] font-medium text-blue-700 border border-blue-200/60">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>E2E Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Connection Body: QR Code + Steps */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5">
        {/* Left Column: Tactile QR Code Display */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md flex items-center justify-center min-w-[210px] min-h-[210px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
                <span className="text-xs text-slate-500 font-medium">Generating QR...</span>
              </div>
            ) : timeLeft === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 px-3">
                <span className="text-xs text-slate-500">QR Code expired for security</span>
                <button
                  type="button"
                  onClick={fetchNewQrSession}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reload QR Code
                </button>
              </div>
            ) : (
              <div className="relative group">
                <div
                  className="w-48 h-48 sm:w-52 sm:h-52 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                {/* Visual scanner indicator */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80 animate-pulse" />
              </div>
            )}
          </div>

          {/* TTL Countdown & Refresh */}
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            {timeLeft > 0 && (
              <span>
                Expires in: <strong className="font-mono text-slate-800">{timeLeft}s</strong>
              </span>
            )}
            <button
              type="button"
              onClick={fetchNewQrSession}
              disabled={isLoading}
              className="text-xs text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer transition"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Right Column: Step-by-Step Instructions & Safeguards */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Steps to Connect WhatsApp
            </h4>
            <ol className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Open <strong>WhatsApp</strong> on your phone.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Tap <strong>Settings</strong> (iOS) or <strong>Menu ⠇</strong> (Android) &gt;{" "}
                  <strong>Linked Devices</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Tap <strong>Link a Device</strong> and point your camera at this QR code.
                </span>
              </li>
            </ol>
          </div>

          {/* Anti-Ban & Anti-Hack Explainer Box */}
          <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>How ConvoDeck Prevents Account Bans &amp; Spam Flags</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
              <li>
                <strong>Humanized Typing Jitter:</strong> Adds 2.2s – 4.8s natural human cadence to prevent automated bot tripwires.
              </li>
              <li>
                <strong>Smart Velocity Throttling:</strong> Caps burst messages at 15 msgs/min for new contacts to keep WhatsApp trust score high.
              </li>
              <li>
                <strong>Zero Password / Session Hijack:</strong> Ephemeral token pairing with HMAC-SHA256 signature guarantees no unauthorized takeover.
              </li>
            </ul>
          </div>

          {/* Local Testing / Instant Pairing Simulation (For Developer & Testing Convenience) */}
          <div className="pt-2 border-t border-slate-200/60">
            {!showSimulateInput ? (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Testing without scanning right now?
                </span>
                <button
                  type="button"
                  onClick={() => setShowSimulateInput(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Instant Test Connect
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Instant Test Mode (Simulate QR Scan)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSimulateInput(false)}
                    className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    disabled={isLinking || !testPhoneNumber.trim()}
                    onClick={() => handleConfirmPairing()}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    {isLinking ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{isLinking ? "Linking..." : "Connect"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
