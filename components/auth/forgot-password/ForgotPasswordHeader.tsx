"use client";

import React from "react";
import Link from "next/link";
import { ForgotPasswordStep, ResetMethod } from "./types";

interface ForgotPasswordHeaderProps {
  step: ForgotPasswordStep;
  method: ResetMethod;
  identifier: string;
}

export function ForgotPasswordHeader({
  step,
  method,
  identifier,
}: ForgotPasswordHeaderProps) {
  const getTitleAndSubtitle = () => {
    switch (step) {
      case "request":
        return {
          title: "Reset your password",
          subtitle: "Choose your recovery method to receive a verification code.",
        };
      case "verify":
        return {
          title: "Enter verification code",
          subtitle: `We sent a 6-digit code to your ${
            method === "email" ? "email" : "phone"
          } (${identifier})`,
        };
      case "reset":
        return {
          title: "Create new password",
          subtitle: "Your new password must be at least 6 characters long.",
        };
      case "success":
        return {
          title: "Password Updated!",
          subtitle: "Your workspace password has been reset successfully.",
        };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
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
        {title}
      </h1>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
        {subtitle}
      </p>
    </div>
  );
}

