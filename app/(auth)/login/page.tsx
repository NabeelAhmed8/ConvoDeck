"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  loginUser,
  verifyLoginCode,
  resendVerificationCode,
} from "@/actions/authActions";

export default function LoginPage() {
  const router = useRouter();

  // Step 1: Login credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: 2FA Verification code state
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
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
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(res.error || "Invalid email or password");
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
      if (res.role === "agent") {
        router.push("/agent/dashboard");
      } else {
        router.push("/dashboard");
      }
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
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl neu-convex flex items-center justify-center font-black text-slate-900 shadow-md text-lg">
            C
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            ConvoDeck
          </span>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {step === "credentials" ? "Sign In to your Workspace" : "Two-Step Verification"}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {step === "credentials"
            ? "Enter your team email and password"
            : `Enter the 6-digit code sent to ${email}`}
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
            /* STEP 1: Email & Password Form */
            <form className="space-y-4" onSubmit={handleLogin} aria-label="Sign in to your account">
              <div>
                <label htmlFor="login-work-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="login-work-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-base sm:text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-account-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="login-account-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-base sm:text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 neu-btn-primary text-white font-bold text-xs rounded-full cursor-pointer border-none shadow-md"
              >
                {loading ? "Verifying..." : "Continue to Workspace"}
              </Button>
            </form>
          ) : (
            /* STEP 2: 2FA Sign-In OTP Code Verification Form */
            <form className="space-y-5" onSubmit={handleVerifyLogin} aria-label="Verify login code">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl neu-pressed text-blue-600 flex items-center justify-center mx-auto mb-3 bg-[#f1f5f9]">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-xs text-slate-600">
                  For your security, we sent a 6-digit login code to <strong className="text-slate-900">{email}</strong>.
                </p>
              </div>

              <div>
                <label
                  htmlFor="login-verification-code"
                  className="block text-xs font-semibold text-slate-700 text-center mb-2"
                >
                  6-Digit Verification Code
                </label>
                <input
                  id="login-verification-code"
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
                className="w-full py-3 neu-btn-primary text-white font-bold text-xs rounded-full cursor-pointer disabled:opacity-50 border-none shadow-md"
              >
                {loading ? "Authenticating..." : "Verify Code & Sign In"}
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

          <div className="mt-6 pt-6 border-t border-slate-200/80 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-blue-600 hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
