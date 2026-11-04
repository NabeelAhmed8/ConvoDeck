"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { NeumorphicCheckbox } from "@/components/ui/NeumorphicCheckbox";
import { loginUser } from "@/actions/authActions";
import { TwoFactorVerifyForm } from "@/components/auth/TwoFactorVerifyForm";
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner";

export default function LoginPage() {
  const router = useRouter();

  // Step 1: Login credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Step 2: 2FA Verification code state
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore remembered workspace email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("convodeck_remembered_admin_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Dynamic Remember Me storage
    if (typeof window !== "undefined") {
      if (rememberMe && email) {
        localStorage.setItem("convodeck_remembered_admin_email", email.trim());
      } else {
        localStorage.removeItem("convodeck_remembered_admin_email");
      }
    }

    const res = await loginUser({ email, password, portal: "workspace" });

    if (res.success && res.requiresVerification) {
      setStep("verify");
      setLoading(false);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
    } else {
      setError(res.error || "Invalid email or password");
      setLoading(false);
    }
  };

  const handleVerifySuccess = (targetPath?: string) => {
    window.location.href = targetPath || "/dashboard";
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
          {step === "credentials" ? "Sign In to your Workspace" : "Two-Step Verification"}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {step === "credentials"
            ? "Enter your team email and password"
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full">
        <div className="neu-card py-7 px-5 sm:py-8 sm:px-8 rounded-3xl text-slate-800 bg-[#edf1f7]">
          {error && step === "credentials" && (
            <AuthAlertBanner message={error} />
          )}

          {step === "credentials" ? (
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
                <PasswordInput
                  id="login-account-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs py-0.5">
                <NeumorphicCheckbox
                  id="login-remember-me"
                  name="rememberMe"
                  label="Remember this device"
                  checked={rememberMe}
                  onChange={setRememberMe}
                />
                <Link
                  href="/forgot-password"
                  className="font-medium text-[#ea5414] hover:text-[#c2410c] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full neu-btn-primary py-2.5 text-xs font-semibold rounded-2xl transition cursor-pointer"
              >
                {loading ? "Authenticating..." : "Continue to Workspace"}
              </Button>
            </form>
          ) : (
            <TwoFactorVerifyForm
              email={email}
              portal="workspace"
              initialPreviewUrl={previewUrl}
              onSuccess={handleVerifySuccess}
              onBack={() => setStep("credentials")}
            />
          )}

          {step === "credentials" && (
            <div className="mt-6 border-t border-slate-200/60 pt-5 text-center text-xs text-slate-500">
              <p>
                Don&apos;t have a workspace yet?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-[#ea5414] hover:text-[#c2410c] ml-1"
                >
                  Start free 14-day trial
                </Link>
              </p>
              <p className="mt-3 text-[11px] text-slate-500">
                Are you a team agent?{" "}
                <Link
                  href="/agent/login"
                  className="font-semibold text-slate-700 hover:text-slate-900 underline ml-0.5"
                >
                  Sign in through Agent Portal &rarr;
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
