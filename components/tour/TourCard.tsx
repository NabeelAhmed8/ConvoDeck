"use client";

import React, { useMemo } from "react";
import {
  Sparkles,
  MessageSquare,
  Kanban,
  Users,
  PlusCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Phone,
  LogOut,
  Compass,
  ArrowUpRight,
  BookOpen,
  X,
  Check,
} from "lucide-react";
import { ITourStep, TourIconName } from "@/constants/tourSteps";

const ICONS: Record<TourIconName, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  MessageSquare,
  Kanban,
  Users,
  PlusCircle,
  Settings,
  ChevronLeft,
  CreditCard,
  Phone,
  LogOut,
  Compass,
  ArrowUpRight,
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
  onOpenDirectory: () => void;
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
  onOpenDirectory,
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
        maxWidth: "430px",
        width: "calc(100vw - 32px)",
      };
    }

    const cardWidth = 380;
    const cardHeight = 280;
    const spacing = 18;

    let left = targetRect.right + spacing;
    let top = targetRect.top;

    if (left + cardWidth > window.innerWidth - 20) {
      left = Math.max(20, targetRect.left - cardWidth - spacing);
    }
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
      {/* Header: Badge & Controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            {step.badge}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            {step.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenDirectory}
            aria-label="Browse All Buttons"
            title="Browse All Buttons Guide"
            className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Buttons</span>
          </button>

          <button
            onClick={onSkip}
            aria-label="Skip Tour"
            title="Skip Tour (Esc)"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Button Title & Icon */}
      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
          <IconComponent className="w-4 h-4" />
        </div>
        <div>
          <h2 id="tour-step-title" className="text-base font-bold text-slate-900 leading-snug">
            {step.title}
          </h2>
          {step.shortcut && (
            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
              Shortcut: {step.shortcut}
            </span>
          )}
        </div>
      </div>

      {/* Step Description */}
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 min-h-[46px]">
        {step.description}
      </p>

      {/* Footer Controls: Dots & Navigation */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
        {/* Step dots */}
        <div className="flex items-center gap-1 overflow-x-hidden max-w-[120px]">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => onGoToStep(idx)}
              aria-label={`Go to button ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer shrink-0 ${
                idx === currentStepIndex
                  ? "w-4 bg-blue-600"
                  : "w-1.5 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isFirstStep && (
            <button
              onClick={onPrev}
              type="button"
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          <button
            onClick={onNext}
            type="button"
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/25 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            {isLastStep ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Finish Guide
              </>
            ) : (
              <>
                Next Button
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
