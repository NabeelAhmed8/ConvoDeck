"use client";

import React, { useMemo } from "react";
import {
  Sparkles,
  MessageSquare,
  Kanban,
  Users,
  PlusCircle,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
} from "lucide-react";
import { ITourStep } from "@/constants/tourSteps";

const ICONS = {
  Sparkles,
  MessageSquare,
  Kanban,
  Users,
  PlusCircle,
  Settings,
};

interface TourCardProps {
  step: ITourStep;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  targetRect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onGoToStep: (index: number) => void;
}

export function TourCard({
  step,
  currentStepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  onGoToStep,
}: TourCardProps) {
  const IconComponent = ICONS[step.iconName] || Sparkles;

  // Compute card positioning based on target element bounding box
  const cardStyle = useMemo<React.CSSProperties>(() => {
    if (!targetRect || typeof window === "undefined" || window.innerWidth < 1024) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "420px",
        width: "calc(100vw - 32px)",
      };
    }

    const cardWidth = 380;
    const cardHeight = 260;
    const spacing = 18;

    // Prefer placing to the right of the sidebar element
    let left = targetRect.right + spacing;
    let top = targetRect.top;

    // If it exceeds right window edge, place below or left
    if (left + cardWidth > window.innerWidth - 20) {
      left = Math.max(20, targetRect.left - cardWidth - spacing);
    }

    // Keep within vertical bounds
    if (top + cardHeight > window.innerHeight - 20) {
      top = Math.max(20, window.innerHeight - cardHeight - 20);
    }

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      maxWidth: `${cardWidth}px`,
      width: "100%",
    };
  }, [targetRect]);

  return (
    <div
      style={cardStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
      className="z-50 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.35)] border border-slate-200/80 text-slate-900 transition-all duration-300 animate-in fade-in zoom-in-95 pointer-events-auto"
    >
      {/* Header: Badge & Close Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
          {step.badge}
        </span>

        <button
          onClick={onSkip}
          aria-label="Skip Tour"
          title="Skip Tour (Esc)"
          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step Title & Icon */}
      <div className="flex items-start gap-3 mb-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
          <IconComponent className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h2 id="tour-step-title" className="text-base sm:text-lg font-bold text-slate-900">
            {step.title}
          </h2>
        </div>
      </div>

      {/* Step Description */}
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 min-h-[44px]">
        {step.description}
      </p>

      {/* Footer Controls: Dots & Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
        {/* Step dots indicator */}
        <div className="flex items-center gap-1.5" aria-label="Tour progress dots">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => onGoToStep(idx)}
              aria-label={`Go to step ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentStepIndex
                  ? "w-6 bg-blue-600"
                  : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {!isFirstStep && (
            <button
              onClick={onPrev}
              type="button"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          <button
            onClick={onNext}
            type="button"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {isLastStep ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
