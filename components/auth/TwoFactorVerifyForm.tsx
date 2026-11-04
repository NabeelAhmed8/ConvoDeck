"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { verifyLoginCode, resendVerificationCode } from "@/actions/authActions";
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner";

interface TwoFactorVerifyFormProps {
  email: string;
  onSuccess: (redirectPath?: string) => void;
  onBack: () => void;
  initialPreviewUrl?: string | null;
  portal?: "workspace" | "agent";
}

export function TwoFactorVerifyForm({
  email,
  onSuccess,
  onBack,
  initialPreviewUrl,
  portal = "workspace",
}: TwoFactorVerifyFormProps) {
  const [otpCode, setOtpCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl || null
  );
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cooldown countdown timer for resend code
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    const res = await verifyLoginCode({
      email,
      code: otpCode.trim(),
      portal,
    });

    if (res.success) {
      const targetPath = res.role === "agent" ? "/agent/dashboard" : "/dashboard";
      onSuccess(targetPath);
    } else {
      setError(res.error || "Invalid verification code");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError("");
    setResendSuccess(false);

    const res = await resendVerificationCode({
      email,
      type: "login",
    });

    setLoading(false);
    if (res.success) {
      setResendCooldown(30);
      setResendSuccess(true);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      setTimeout(() => setResendSuccess(false), 4000);
    } else {
      setError(res.error || "Failed to resend code");
    }
  };

  return (
    <div>
      {error && <AuthAlertBanner message={error} />}

      {resendSuccess && (
        <AuthAlertBanner
          type="success"
          message="A fresh login verification code has been dispatched."
        />
      )}

      <form
        className="space-y-4"
        onSubmit={handleVerifyOtp}
        aria-label="Enter verification code"
      >
        <div>
          <label
            htmlFor="login-otp-code"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            6-Digit Security Code <span className="text-rose-500" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <Lock
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="login-otp-code"
              name="otpCode"
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
              aria-required="true"
              autoFocus
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Check your inbox (or spam) for the one-time code sent to {email}.
          </p>
        </div>

        {/* Development preview email banner */}
        {previewUrl && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-center justify-between gap-2">
            <span>Dev Mode: View test email</span>
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

        <Button
          type="submit"
          disabled={loading || otpCode.length !== 6}
          className="w-full neu-btn-primary py-2.5 text-xs font-semibold rounded-2xl transition cursor-pointer"
        >
          {loading ? "Verifying Session..." : "Verify & Sign In"}
        </Button>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back to credentials
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
