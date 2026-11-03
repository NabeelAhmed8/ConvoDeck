"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, AlertCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginUser } from "@/actions/authActions";
import { TwoFactorVerifyForm } from "@/components/auth/TwoFactorVerifyForm";

function AgentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  // Step 1: Login credentials
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");

  // Step 2: 2FA Verification code state
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync email from URL query if provided
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await loginUser({ email, password });

    if (res.success && res.requiresVerification) {
      setStep("verify");
      setLoading(false);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
    } else if (res.success) {
      router.push("/agent/dashboard");
      router.refresh();
    } else {
      setError(res.error || "Invalid agent credentials");
      setLoading(false);
    }
  };

  const handleVerifySuccess = (targetPath?: string) => {
    router.push(targetPath || "/agent/dashboard");
    router.refresh();
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-pressed text-[#ea5414] text-xs font-semibold mb-3">
          <Headphones className="w-3.5 h-3.5 text-[#ff6422]" aria-hidden="true" />
          Agent Support Desk
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {step === "credentials" ? "Agent Workspace Sign In" : "Two-Step Verification"}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {step === "credentials"
            ? "Enter your assigned sales agent credentials"
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full">
        <div className="neu-card py-7 px-5 sm:py-8 sm:px-8 rounded-3xl text-slate-800 bg-[#edf1f7]">
          {error && step === "credentials" && (
            <div
              role="alert"
              className="mb-4 p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {step === "credentials" ? (
            <form className="space-y-4" onSubmit={handleLogin} aria-label="Sign in as an agent">
              <div>
                <label htmlFor="agent-work-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Agent Work Email <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="agent-work-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="agent@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-base sm:text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="agent-account-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Password <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <PasswordInput
                  id="agent-account-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full neu-btn-primary py-2.5 text-xs font-semibold rounded-2xl transition cursor-pointer"
              >
                {loading ? "Verifying Credentials..." : "Access Support Dashboard"}
              </Button>
            </form>
          ) : (
            <TwoFactorVerifyForm
              email={email}
              initialPreviewUrl={previewUrl}
              onSuccess={handleVerifySuccess}
              onBack={() => setStep("credentials")}
            />
          )}

          {step === "credentials" && (
            <div className="mt-6 border-t border-slate-300/40 pt-5 text-center text-xs text-slate-500">
              <p>
                Are you an account administrator?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#ea5414] hover:text-[#c2410c] ml-1"
                >
                  Admin workspace login &rarr;
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgentLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#ebf0f7]" />}>
      <AgentLoginForm />
    </Suspense>
  );
}
