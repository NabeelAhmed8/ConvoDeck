"use client";

import React, { useState } from "react";
import { Mail, Phone, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NeumorphicAutocompleteInput } from "@/components/ui/NeumorphicAutocompleteInput";
import { requestPasswordReset, ResetMethod } from "@/actions/forgotPasswordActions";

interface ForgotPasswordRequestStepProps {
  initialMethod?: ResetMethod;
  initialIdentifier?: string;
  onSuccess: (data: {
    identifier: string;
    method: ResetMethod;
    previewUrl?: string;
    devCode?: string;
  }) => void;
}

export function ForgotPasswordRequestStep({
  initialMethod = "email",
  initialIdentifier = "",
  onSuccess,
}: ForgotPasswordRequestStepProps) {
  const [method, setMethod] = useState<ResetMethod>(initialMethod);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError(
        method === "email"
          ? "Please enter your work email address"
          : "Please enter your registered phone number"
      );
      return;
    }

    setLoading(true);

    const res = await requestPasswordReset({
      identifier: identifier.trim(),
      method,
    });

    setLoading(false);

    if (res.success && res.identifier) {
      onSuccess({
        identifier: res.identifier,
        method: res.method,
        previewUrl: res.previewUrl,
        devCode: res.devCode,
      });
    } else {
      setError(res.error || "Failed to send reset code. Please try again.");
    }
  };

  return (
    <div>
      {/* Recovery Method Tabs */}
      <div className="flex p-1 neu-tab-container rounded-full mb-5">
        <button
          type="button"
          onClick={() => {
            setMethod("email");
            setError("");
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            method === "email"
              ? "neu-tab-active"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Work Email</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("phone");
            setError("");
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            method === "phone"
              ? "neu-tab-active"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Phone / WhatsApp</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
        <NeumorphicAutocompleteInput
          id="forgot-password-identifier"
          name="identifier"
          type={method === "email" ? "email" : "tel"}
          label={method === "email" ? "Registered Email" : "Phone Number (with Country Code)"}
          required
          autoFocus
          placeholder={
            method === "email"
              ? "name@company.com"
              : "+92 300 1234567 or 15551234567"
          }
          value={identifier}
          onChange={setIdentifier}
          storageKey={method === "email" ? "forgot_pwd_emails" : "forgot_pwd_phones"}
          icon={
            method === "email" ? (
              <Mail className="w-4 h-4 text-slate-500" aria-hidden="true" />
            ) : (
              <Phone className="w-4 h-4 text-slate-500" aria-hidden="true" />
            )
          }
        />
        <p className="mt-1 text-[11px] text-slate-500">
          {method === "email"
            ? "We'll send a 6-digit one-time code to your registered email."
            : "We'll send a 6-digit one-time verification code via WhatsApp/SMS."}
        </p>

        <Button
          type="submit"
          disabled={loading}
          className="w-full neu-btn-primary py-2.5 text-xs font-semibold rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{loading ? "Sending Code..." : "Send Verification Code"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}

