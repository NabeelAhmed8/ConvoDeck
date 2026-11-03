"use client";

import React, { useMemo } from "react";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Users,
  CreditCard,
  Settings,
  PlusCircle,
  Phone,
  Compass,
  LogOut,
  ArrowUpRight,
  X,
  BookOpen,
} from "lucide-react";
import { ITourStep } from "./tourTypes";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  ChevronLeft,
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Users,
  CreditCard,
  Settings,
  PlusCircle,
  Phone,
  Compass,
  LogOut,
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
  const Icon = ICONS[step.iconName] || Sparkles;

  // Compute responsive card position
  const { top, left } = useMemo(() => {
    if (typeof window === "undefined") {
      return { top: 100, left: 100 };
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const cardW = 360;
    const cardH = 260;
    const pad = 16;

    // Mobile screens (< 768px): Dock at bottom or top away from target
    if (winW < 768 || !targetRect) {
      const mobileW = Math.min(cardW, winW - pad * 2);
      const l = Math.max(pad, (winW - mobileW) / 2);

      if (!targetRect) {
        return { top: Math.max(pad, (winH - cardH) / 2), left: l };
      }

      // If target is in the lower half of screen, position card near top
      // If target is in the upper half of screen, position card near bottom
      const isTargetInLowerHalf = targetRect.top > winH / 2;
      const t = isTargetInLowerHalf
        ? Math.max(pad, 16)
        : Math.max(pad, winH - cardH - pad - 10);

      return { top: t, left: l };
    }

    // Desktop: Position to the right of target if room allows, otherwise left/bottom
    const spacing = 18;
    let l = targetRect.right + spacing;

    // If runs out of right room, place to left
    if (l + cardW > winW - pad) {
      if (targetRect.left - cardW - spacing >= pad) {
        l = targetRect.left - cardW - spacing;
      } else {
        l = Math.max(pad, Math.min(targetRect.left, winW - cardW - pad));
      }
    }

    // Vertically center with target
    const targetMidY = targetRect.top + targetRect.height / 2;
    let t = targetMidY - cardH / 2;
    t = Math.max(pad, Math.min(t, winH - cardH - pad));

    return { top: t, left: l };
  }, [targetRect]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ConvoDeck Interactive Tour"
      style={{
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: "min(360px, calc(100vw - 28px))",
        transition:
          "top 0.28s cubic-bezier(0.16, 1, 0.3, 1), left 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className="z-[70] bg-[#edf1f7] rounded-[28px] p-5 sm:p-6 shadow-[10px_10px_28px_rgba(166,178,196,0.5),-10px_-10px_28px_#ffffff] border border-white/90 text-slate-900 pointer-events-auto select-none"
    >
      {/* 1. Header Row: Step Pill + Category Tag + Close X */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="neu-pressed px-2.5 py-1 rounded-full text-[11px] font-bold text-[#ea5414] flex items-center gap-1.5 bg-[#fff4ed]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6422] animate-pulse" />
            <span>Step {currentStepIndex + 1} of {totalSteps}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {step.category}
          </span>
        </div>

        <button
          type="button"
          onClick={onSkip}
          aria-label="Close tour"
          className="w-7 h-7 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Middle Row: Squircle Tile + Title + Friendly Description */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl neu-convex flex items-center justify-center shrink-0 text-slate-900 shadow-sm mt-0.5">
          <Icon className="w-5 h-5 text-slate-900" />
        </div>
        <div className="min-w-0">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
            {step.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* 3. Interactive Step Dots Indicator */}
      <div className="flex items-center gap-1.5 mb-4 px-0.5">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isActive = idx === currentStepIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onGoToStep(idx)}
              aria-label={`Jump to step ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? "w-6 bg-[#ff6422]"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          );
        })}
      </div>

      {/* 4. Controls Row: Directory link + Prev + Next */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-300/40">
        <button
          type="button"
          onClick={onOpenDirectory}
          className="text-[11px] font-bold text-slate-500 hover:text-[#ea5414] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>All Buttons</span>
        </button>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous step"
              className="px-3.5 py-1.5 text-xs font-bold neu-btn rounded-full text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            aria-label={isLastStep ? "Finish tour" : "Next step"}
            className="px-4 py-1.5 text-xs font-bold neu-btn-primary rounded-full text-white flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <span>{isLastStep ? "Done" : "Next"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
