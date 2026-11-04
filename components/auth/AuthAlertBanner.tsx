"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface AuthAlertBannerProps {
  message: string;
  type?: "error" | "success";
  className?: string;
}

/**
 * Reusable Neumorphic Alert Banner for Auth and Verification screens.
 * Features tactile recessed styling (neu-pressed), convex icon badge,
 * and clean structured title & subtitle text hierarchy.
 */
export function AuthAlertBanner({
  message,
  type = "error",
  className = "",
}: AuthAlertBannerProps) {
  if (!message) return null;

  const isError = type === "error";

  // Dynamic text parsing: Split if message contains " — " to emphasize subject/user
  const hasDivider = message.includes(" — ");
  const [headline, detail] = hasDivider ? message.split(" — ") : [message, null];

  return (
    <div
      role="alert"
      className={`mb-4 p-3 sm:p-3.5 rounded-2xl neu-pressed transition-all duration-200 ${
        isError
          ? "bg-[#f8edee] border border-rose-300/50 shadow-[inset_3px_3px_6px_#dfced1,inset_-3px_-3px_6px_#ffffff]"
          : "bg-[#edf8f1] border border-emerald-300/50 shadow-[inset_3px_3px_6px_#cedfd3,inset_-3px_-3px_6px_#ffffff]"
      } flex items-center gap-3 ${className}`}
    >
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 neu-convex shadow-sm ${
          isError
            ? "bg-rose-50 text-rose-600 border border-rose-200/60"
            : "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
        }`}
        aria-hidden="true"
      >
        {isError ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
      </div>

      <div className="text-xs leading-snug flex-1 text-left min-w-0">
        {detail ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-900 tracking-tight">
              {headline}
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              {detail}
            </span>
          </div>
        ) : (
          <span className="font-medium text-slate-800 break-words">{headline}</span>
        )}
      </div>
    </div>
  );
}
