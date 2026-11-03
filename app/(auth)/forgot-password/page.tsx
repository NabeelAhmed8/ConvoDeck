"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ForgotPasswordStep,
  ResetMethod,
} from "@/components/auth/forgot-password/types";
import { ForgotPasswordHeader } from "@/components/auth/forgot-password/ForgotPasswordHeader";
import { StepIndicator } from "@/components/auth/forgot-password/StepIndicator";
import { ForgotPasswordRequestStep } from "@/components/auth/forgot-password/ForgotPasswordRequestStep";
import { ForgotPasswordVerifyStep } from "@/components/auth/forgot-password/ForgotPasswordVerifyStep";
import { ForgotPasswordResetStep } from "@/components/auth/forgot-password/ForgotPasswordResetStep";
import { ForgotPasswordSuccessStep } from "@/components/auth/forgot-password/ForgotPasswordSuccessStep";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ForgotPasswordStep>("request");
  const [method, setMethod] = useState<ResetMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const handleRequestSuccess = (data: {
    identifier: string;
    method: ResetMethod;
    previewUrl?: string;
    devCode?: string;
  }) => {
    setIdentifier(data.identifier);
    setMethod(data.method);
    if (data.previewUrl) setPreviewUrl(data.previewUrl);
    if (data.devCode) setDevCode(data.devCode);
    setStep("verify");
  };

  const handleVerifySuccess = (verifiedCode: string) => {
    setCode(verifiedCode);
    setStep("reset");
  };

  const handleResetSuccess = () => {
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-[#ebf0f7] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Branding Header */}
      <ForgotPasswordHeader
        step={step}
        method={method}
        identifier={identifier}
      />

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full">
        <div className="neu-card py-7 px-5 sm:py-8 sm:px-8 rounded-3xl text-slate-800 bg-[#edf1f7]">
          {/* Step Progress Bar */}
          <StepIndicator currentStep={step} />

          {/* Wizard Steps */}
          {step === "request" && (
            <ForgotPasswordRequestStep
              initialMethod={method}
              initialIdentifier={identifier}
              onSuccess={handleRequestSuccess}
            />
          )}

          {step === "verify" && (
            <ForgotPasswordVerifyStep
              identifier={identifier}
              method={method}
              initialPreviewUrl={previewUrl}
              initialDevCode={devCode}
              onSuccess={handleVerifySuccess}
              onBack={() => setStep("request")}
            />
          )}

          {step === "reset" && (
            <ForgotPasswordResetStep
              identifier={identifier}
              code={code}
              onSuccess={handleResetSuccess}
            />
          )}

          {step === "success" && <ForgotPasswordSuccessStep />}

          {/* Footer Navigation */}
          {step !== "success" && (
            <div className="mt-6 border-t border-slate-300/40 pt-5 text-center text-xs text-slate-500">
              <p>
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#ea5414] hover:text-[#c2410c] ml-1 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

