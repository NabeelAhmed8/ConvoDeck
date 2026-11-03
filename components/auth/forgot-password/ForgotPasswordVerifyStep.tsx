"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  verifyPasswordResetCode,
  resendPasswordResetCode,
  ResetMethod,
} from "@/actions/forgotPasswordActions";

interface ForgotPasswordVerifyStepProps {
  identifier: string;
  method: ResetMethod;
  initialPreviewUrl?: string | null;
  initialDevCode?: string | null;
  onSuccess: (code: string) => void;
  onBack: () => void;
}

export function ForgotPasswordVerifyStep({
  identifier,
  method,
  initialPreviewUrl,
  initialDevCode,
  onSuccess,
  onBack,
}: ForgotPasswordVerifyStepProps) {
  const [otpCode, setOtpCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl || null
  );
  const [devCode, setDevCode] = useState<string | null>(
    initialDevCode || null
  );
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();

    if (cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    const res = await verifyPasswordResetCode({
      identifier,
      code: cleanCode,
    });

    setLoading(false);

    if (res.success) {
      onSuccess(cleanCode);
    } else {
      setError(res.error || "Invalid verification code. Please check and retry.");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError("");
    setResendSuccess(false);

    const res = await resendPasswordResetCode({
      identifier,
      method,
    });

    setLoading(false);

    if (res.success) {
      setResendCooldown(30);
      setResendSuccess(true);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      if (res.devCode) setDevCode(res.devCode);
      setTimeout(() => setResendSuccess(false), 4000);
    } else {
      setError(res.error || "Failed to resend code");
    }
  };

  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {resendSuccess && (
        <div
          role="status"
          className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl text-xs flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>A fresh verification code has been dispatched.</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleVerify}>
        <div>
          <label
            htmlFor="forgot-password-code"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            6-Digit Verification Code{" "}
            <span className="text-rose-500" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <Lock
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="forgot-password-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="w-full pl-9 pr-3.5 py-2.5 text-center tracking-widest text-lg font-mono neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
              required
              autoFocus
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Enter the 6-digit code dispatched to {identifier}.
          </p>
        </div>

        {/* Development Preview Mode Links */}
        {previewUrl && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-center justify-between gap-2">
            <span>Dev Mode: Ethereal Test Mailbox</span>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-900 underline"
            >
              Open Email <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        )}

        {devCode && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl text-[11px] text-orange-950 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 font-semibold text-orange-900">
              <KeyRound className="w-3.5 h-3.5 text-[#ff6422]" />
              Dev Phone OTP:
            </span>
            <span className="font-mono font-bold text-[#ea5414] text-xs tracking-wider">
              {devCode}
            </span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || otpCode.length !== 6}
          className="w-full neu-btn-primary py-2.5 text-xs font-semibold rounded-2xl transition cursor-pointer"
        >
          {loading ? "Verifying Code..." : "Verify & Continue"}
        </Button>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Change {method}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className={`font-semibold flex items-center gap-1 cursor-pointer ${
              resendCooldown > 0
                ? "text-slate-400 cursor-not-allowed"
                : "text-[#ea5414] hover:text-[#c2410c]"
            }`}
          >
            <RefreshCw
              className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend Code"}
          </button>
        </div>
      </form>
    </div>
  );
}

