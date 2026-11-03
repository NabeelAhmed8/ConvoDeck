"use client";

import React from "react";
import { Check } from "lucide-react";
import { ForgotPasswordStep } from "./types";

interface StepIndicatorProps {
  currentStep: ForgotPasswordStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  if (currentStep === "success") return null;

  const steps: { key: ForgotPasswordStep; label: string; number: number }[] = [
    { key: "request", label: "Recovery", number: 1 },
    { key: "verify", label: "Verification", number: 2 },
    { key: "reset", label: "New Password", number: 3 },
  ];

  const getStepIndex = (step: ForgotPasswordStep) => {
    switch (step) {
      case "request":
        return 1;
      case "verify":
        return 2;
      case "reset":
        return 3;
      case "success":
        return 4;
    }
  };

  const activeIndex = getStepIndex(currentStep);

  return (
    <div className="flex items-center justify-between mb-6 px-3">
      {steps.map((s, idx) => {
        const isCompleted = activeIndex > s.number;
        const isActive = activeIndex === s.number;

        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-sm"
                    : isActive
                    ? "neu-btn-primary text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  s.number
                )}
              </div>
              <span
                className={`text-[11px] font-medium hidden sm:inline ${
                  isActive
                    ? "text-slate-900 font-semibold"
                    : isCompleted
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                  activeIndex > s.number ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

