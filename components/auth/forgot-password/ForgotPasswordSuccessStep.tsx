"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordSuccessStep() {
  return (
    <div className="text-center py-2 space-y-4">
      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
      </div>

      <div className="space-y-1">
        <h2 className="text-base font-bold text-slate-900">
          Password Reset Complete
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Your new password has been saved. For security, all active sessions on other devices have been logged out.
        </p>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2 text-left">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your account is now secured with your new credentials.</span>
      </div>

      <Link href="/login" className="block w-full">
        <Button
          type="button"
          className="w-full neu-btn-primary py-2.5 text-xs font-semibold rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Continue to Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}

