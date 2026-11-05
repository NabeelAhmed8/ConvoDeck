"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  Building,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PhoneInputField } from "@/components/ui/PhoneInputField";
import { NeumorphicAutocompleteInput } from "@/components/ui/NeumorphicAutocompleteInput";
import {
  signupUser,
  verifySignupCode,
  resendVerificationCode,
} from "@/actions/authActions";

export default function SignupPage() {
  const router = useRouter();

  // Step 1: Form state
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState("+92");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Verification state
  const [step, setStep] = useState<"form" | "verify">("form");
  const [otpCode, setOtpCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cooldown countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate phone number
    const digitsOnly = phone.replace(/\D/g, "");
    if (!digitsOnly || digitsOnly.length < 5) {
      setError("Please enter a valid phone number with at least 5 digits");
      setLoading(false);
      return;
    }

    // Strip leading zeroes before appending country dial code (e.g., 0300 -> 300)
    const formattedDigits = digitsOnly.replace(/^0+/, "");
    const fullPhone = `${dialCode}${formattedDigits}`;

    const res = await signupUser({
      name,
      companyName,
      email,
      password,
      phone: fullPhone,
    });

    if (res.success && res.requiresVerification) {
      setStep("verify");
      setLoading(false);
      setResendCooldown(30);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
    } else if (res.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(res.error || "Failed to create account");
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    const res = await verifySignupCode({
      email,
      code: otpCode.trim(),
    });

    if (res.success) {
      router.push("/dashboard");
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
      type: "signup",
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
    <div className="min-h-screen bg-[#ebf0f7] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
          {step === "form" ? "Create your Company Workspace" : "Verify your Email Address"}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {step === "form"
            ? "Setup your CRM and invite your sales agents"
            : `We sent a 6-digit verification code to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full">
        <div className="neu-card py-7 px-5 sm:py-8 sm:px-8 rounded-3xl text-slate-800 bg-[#edf1f7]">
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
              <span>A new verification code has been dispatched to your email.</span>
            </div>
          )}

          {step === "form" ? (
            /* STEP 1: Registration Form */
            <form className="space-y-4" onSubmit={handleSignup} aria-label="Create workspace account">
              <NeumorphicAutocompleteInput
                id="signup-full-name"
                name="fullName"
                type="text"
                label="Your Full Name"
                required
                placeholder="e.g. Asad Ali"
                value={name}
                onChange={setName}
                storageKey="user_names"
                icon={<User className="w-4 h-4 text-slate-500" />}
              />

              <NeumorphicAutocompleteInput
                id="signup-company-name"
                name="company"
                type="text"
                label="Company / Agency Name"
                required
                placeholder="e.g. Apex Marketing"
                value={companyName}
                onChange={setCompanyName}
                storageKey="workspace_names"
                icon={<Building className="w-4 h-4 text-slate-500" />}
              />

              <NeumorphicAutocompleteInput
                id="signup-work-email"
                name="email"
                type="email"
                label="Work Email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={setEmail}
                storageKey="user_emails"
                icon={<Mail className="w-4 h-4 text-slate-500" />}
              />

              <PhoneInputField
                id="signup-phone-number"
                name="phone"
                label="WhatsApp / Phone Number"
                dialCode={dialCode}
                phoneNumber={phone}
                onDialCodeChange={setDialCode}
                onPhoneNumberChange={setPhone}
                placeholder="300 1234567"
                required
              />

              <div>
                <label htmlFor="signup-account-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <PasswordInput
                  id="signup-account-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 neu-btn-primary font-bold text-xs rounded-full cursor-pointer border-none shadow-md"
              >
                {loading ? "Sending verification code..." : "Continue with Email Verification"}
              </Button>
            </form>
          ) : (
            /* STEP 2: Email OTP Verification Form */
            <form className="space-y-5" onSubmit={handleVerifyCode} aria-label="Verify your email code">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl neu-pressed text-[#ff6422] flex items-center justify-center mx-auto mb-3 bg-[#e9eff6]">
                  <Mail className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-xs text-slate-600">
                  Please check your inbox at <strong className="text-slate-900">{email}</strong> and enter the 6-digit code.
                </p>
              </div>

              <div>
                <label
                  htmlFor="signup-verification-code"
                  className="block text-xs font-semibold text-slate-700 text-center mb-2"
                >
                  6-Digit Verification Code
                </label>
                <input
                  id="signup-verification-code"
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
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-[#ea5414] flex items-center justify-between">
                  <span>Development Preview Available</span>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold flex items-center gap-1 hover:text-[#c2410c]"
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
                {loading ? "Verifying..." : "Verify & Activate Workspace"}
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setError("");
                    setOtpCode("");
                  }}
                  className="text-slate-600 hover:text-slate-900 neu-btn px-4 py-2 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change Email
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResend}
                  className="text-[#ea5414] hover:text-[#c2410c] disabled:opacity-50 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-300/40 text-center text-xs text-slate-500">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-bold text-[#ea5414] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
