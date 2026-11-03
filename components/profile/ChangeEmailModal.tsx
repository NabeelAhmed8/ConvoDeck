"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  sendEmailChangeCode,
  verifyEmailChangeCode,
  updateUserEmail,
} from "@/actions/profileActions";
import { toast } from "@/store/useToastStore";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onEmailChanged: (newEmail: string) => void;
}

type ChangeEmailStep = "init" | "verify" | "new_email";

/**
 * ChangeEmailModal
 * Single Responsibility: Modal dialog that guides the admin through changing
 * their primary email address by first verifying their existing email via a 6-digit OTP.
 */
export function ChangeEmailModal({
  isOpen,
  onClose,
  currentEmail,
  onEmailChanged,
}: ChangeEmailModalProps) {
  const [step, setStep] = useState<ChangeEmailStep>("init");
  const [code, setCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep("init");
      setCode("");
      setNewEmail("");
      setError("");
      setPreviewUrl(null);
      setResendCooldown(0);
    }
  }, [isOpen]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  // Step 1: Send OTP code to current email
  const handleSendCode = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await sendEmailChangeCode();
      if (res.success) {
        setStep("verify");
        setResendCooldown(30);
        if (res.previewUrl) setPreviewUrl(res.previewUrl);
        toast.info("Verification Code Dispatched", `Sent to ${currentEmail}`);
      } else {
        setError(res.error || "Failed to send verification code.");
      }
    } catch {
      setError("An unexpected error occurred while sending the code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await verifyEmailChangeCode({ code: code.trim() });
      if (res.success) {
        setStep("new_email");
        setError("");
      } else {
        setError(res.error || "Invalid verification code.");
      }
    } catch {
      setError("An unexpected error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit New Email
  const handleSubmitNewEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.toLowerCase().trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cleanEmail === currentEmail.toLowerCase().trim()) {
      setError("New email must be different from your current email.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await updateUserEmail({ newEmail: cleanEmail });
      if (res.success && res.email) {
        toast.success("Email Address Updated", `Primary login is now ${res.email}`);
        onEmailChanged(res.email);
        onClose();
      } else {
        setError(res.error || "Failed to update email.");
      }
    } catch {
      setError("An unexpected error occurred while updating email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-email-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto animate-in fade-in"
    >
      <div className="w-full max-w-md neu-card bg-[#edf1f7] rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/80 relative space-y-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-300/40 pb-3 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/60 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 id="change-email-title" className="text-sm sm:text-base font-bold text-slate-900">
              Change Primary Email
            </h2>
            <p className="text-[11px] text-slate-500">
              Two-step security verification required
            </p>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div
            className={`p-2 rounded-xl text-center font-semibold transition-all ${
              step === "init" || step === "verify"
                ? "bg-orange-100/70 text-[#ea5414] neu-pressed"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center justify-center gap-1"
            }`}
          >
            {step === "new_email" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Current Verified</span>
              </>
            ) : (
              "1. Verify Current Email"
            )}
          </div>
          <div
            className={`p-2 rounded-xl text-center font-semibold transition-all ${
              step === "new_email"
                ? "bg-orange-100/70 text-[#ea5414] neu-pressed"
                : "bg-slate-200/50 text-slate-500"
            }`}
          >
            2. Enter New Email
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-[11px] leading-tight">{error}</span>
          </div>
        )}

        {/* STEP 1: INITIAL DISPATCH */}
        {step === "init" && (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-2xl neu-pressed bg-[#edf2f8] text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Registered Email
              </span>
              <p className="font-bold text-slate-900 break-all">{currentEmail}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To protect your workspace, we will send a 6-digit confirmation code to your current email address before allowing a change.
            </p>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={loading}
              className="w-full py-2.5 neu-btn-primary rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: VERIFY 6-DIGIT CODE */}
        {step === "verify" && (
          <form onSubmit={handleVerifyCode} className="space-y-4 pt-1">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter the 6-digit code sent to <strong className="text-slate-900">{currentEmail}</strong>:
            </p>

            <div>
              <label
                htmlFor="email-change-code"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                6-Digit Security Code
              </label>
              <input
                id="email-change-code"
                name="verificationCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                autoComplete="one-time-code"
                required
                className="w-full py-2.5 px-3 neu-input rounded-2xl text-center text-lg tracking-widest font-mono font-bold text-slate-900 placeholder-slate-300 focus:outline-none"
              />
            </div>

            {/* Simulated Ethereal preview link for local development */}
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-[11px] text-[#ea5414] hover:underline"
              >
                <span>[Dev Mode] View Verification Code in Mail Preview</span>
                <ExternalLink className="w-3 h-3 inline ml-1" />
              </a>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={resendCooldown > 0 || loading}
                className="text-slate-500 hover:text-slate-800 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed font-medium text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend Code"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-2.5 neu-btn-primary rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? "Verifying..." : "Verify Code & Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 3: ENTER NEW EMAIL */}
        {step === "new_email" && (
          <form onSubmit={handleSubmitNewEmail} className="space-y-4 pt-1">
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px]">Identity verified! Enter your new email address below.</span>
            </div>

            <div>
              <label
                htmlFor="new-profile-email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                New Primary Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="new-profile-email"
                  name="newEmail"
                  type="email"
                  autoComplete="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newEmail}
              className="w-full py-2.5 neu-btn-primary rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? "Updating Primary Email..." : "Confirm & Save New Email"}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

