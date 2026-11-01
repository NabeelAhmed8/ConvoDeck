"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  loginUser,
  verifyLoginCode,
  resendVerificationCode,
} from "@/actions/authActions";

function AgentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  // Step 1: Login credentials
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");

  // Step 2: 2FA Verification code state
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync email from URL query if provided
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Cooldown countdown timer for resend code
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await loginUser({ email, password });

    if (res.success && res.requiresVerification) {
      setStep("verify");
      setLoading(false);
      setResendCooldown(30);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
    } else if (res.success) {
      router.push("/agent/dashboard");
      router.refresh();
    } else {
      setError(res.error || "Invalid agent credentials");
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    const res = await verifyLoginCode({
      email,
      code: otpCode.trim(),
    });

    if (res.success) {
      router.push("/agent/dashboard");
      router.refresh();
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
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-2xl neu-convex flex items-center justify-center font-black text-slate-900 shadow-md text-lg">
            <Headphones className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            ConvoDeck
          </span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-pressed text-blue-700 text-xs font-bold mb-3 border border-blue-200 bg-[#f1f5f9]">
          <Headphones className="w-3.5 h-3.5" />
          Agent Sales Portal • Direct Sign-In
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {step === "credentials"
            ? "Sign In to Agent Workstation"
            : "Agent Two-Step Verification"}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {step === "credentials"
            ? "Enter your company-assigned email and password"
            : `Enter the 6-digit security code sent to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full">
        <div className="neu-card py-7 px-5 sm:py-8 sm:px-8 rounded-3xl text-slate-800 bg-white">
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
              <span>A fresh login verification code has been dispatched.</span>
            </div>
          )}

          {step === "credentials" ? (
            /* STEP 1: Agent Email & Password Form (Sign-In Only, No Sign-Up) */
            <form className="space-y-4" onSubmit={handleLogin} aria-label="Sign in to agent workstation">
              <div>
                <label htmlFor="agent-login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Agent Work Email <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="agent-login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="agent@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="agent-login-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="agent-login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 neu-btn-primary font-bold text-xs rounded-full cursor-pointer border-none shadow-md"
              >
                {loading ? "Authenticating Agent..." : "Sign In to Agent Portal"}
              </Button>
            </form>
          ) : (
            /* STEP 2: 2FA Sign-In OTP Code Verification Form */
            <form className="space-y-5" onSubmit={handleVerifyLogin} aria-label="Verify agent login code">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl neu-pressed text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-xs text-slate-600">
                  Enter the 6-digit verification code sent to <strong className="text-slate-900">{email}</strong>.
                </p>
              </div>

              <div>
                <label
                  htmlFor="agent-verification-code"
                  className="block text-xs font-semibold text-slate-700 text-center mb-2"
                >
                  6-Digit Verification Code
                </label>
                <input
                  id="agent-verification-code"
                  name="verificationCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full py-3 text-center text-xl sm:text-2xl font-mono font-bold tracking-[0.3em] sm:tracking-[0.5em] neu-pressed rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
                  required
                  aria-required="true"
                />
              </div>

              {previewUrl && (
                <div className="p-3 bg-blue-100 border border-blue-300 rounded-2xl text-xs text-blue-800 flex items-center justify-between">
                  <span>Development Preview Available</span>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold flex items-center gap-1 hover:text-blue-900"
                  >
                    View Email <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3 neu-btn-primary font-black text-xs rounded-full cursor-pointer disabled:opacity-50 border-none shadow-md"
              >
                {loading ? "Verifying..." : "Verify & Open Workstation"}
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setError("");
                    setOtpCode("");
                  }}
                  className="text-slate-600 hover:text-slate-900 neu-btn px-4 py-2 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResend}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          {/* Dedicated Agent Security Notice (Strictly NO Sign-Up Option) */}
          <div className="mt-6 pt-6 border-t border-slate-200/80 text-center text-xs text-slate-500">
            <div className="inline-flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Restricted Agent Portal • Sign-In Only</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
              Agent accounts are created exclusively by your workspace administrator. Self sign-up is disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
          Loading Agent Portal...
        </div>
      }
    >
      <AgentLoginForm />
    </Suspense>
  );
}
