"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { NeumorphicCheckbox } from "@/components/ui/NeumorphicCheckbox";
import { NeumorphicAutocompleteInput } from "@/components/ui/NeumorphicAutocompleteInput";
import { loginUser } from "@/actions/authActions";
import { TwoFactorVerifyForm } from "@/components/auth/TwoFactorVerifyForm";
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner";

function AgentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  // Step 1: Login credentials
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Step 2: 2FA Verification code state
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync email from URL query or localStorage if Remember Me was previously set
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    } else if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("convodeck_remembered_agent_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, [emailParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Dynamic Remember Me storage
    if (typeof window !== "undefined") {
      if (rememberMe && email) {
        localStorage.setItem("convodeck_remembered_agent_email", email.trim());
      } else {
        localStorage.removeItem("convodeck_remembered_agent_email");
      }
    }

    const res = await loginUser({ email, password, portal: "agent" });

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
    window.location.href = targetPath || "/agent/dashboard";
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
            <AuthAlertBanner message={error} />
          )}

          {step === "credentials" ? (
            <form className="space-y-4" onSubmit={handleLogin} aria-label="Sign in as an agent">
              <NeumorphicAutocompleteInput
                id="agent-work-email"
                name="email"
                type="email"
                label="Agent Work Email"
                required
                placeholder="agent@company.com"
                value={email}
                onChange={setEmail}
                storageKey="agent_login_emails"
                icon={<Mail className="w-4 h-4" />}
              />

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

              <div className="flex items-center justify-between text-xs py-0.5">
                <NeumorphicCheckbox
                  id="agent-remember-me"
                  name="rememberMe"
                  label="Remember this workstation"
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
                {loading ? "Verifying Credentials..." : "Access Support Dashboard"}
              </Button>
            </form>
          ) : (
            <TwoFactorVerifyForm
              email={email}
              portal="agent"
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
