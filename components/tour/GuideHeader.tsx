"use client";

import React from "react";
import { X } from "lucide-react";
import { IGuideStep } from "./guideStepsData";

interface GuideHeaderProps {
  step: IGuideStep;
  stepIndex: number;
  totalSteps: number;
  onClose: () => void;
}

/**
 * GuideHeader
 * Single-responsibility component for rendering the modal header,
 * step indicator pill, category badge, and tactile close button.
 */
export function GuideHeader({
  step,
  stepIndex,
  totalSteps,
  onClose,
}: GuideHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-300/40 gap-2 shrink-0">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        <div className="neu-pressed px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-[#ea5414] flex items-center gap-1.5 bg-[#fff4ed] shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#ff6422] animate-pulse shrink-0" />
          <span className="whitespace-nowrap">Step {stepIndex + 1} of {totalSteps}</span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {step.badge}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close guide modal"
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full neu-btn flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
      </button>
    </div>
  );
}

