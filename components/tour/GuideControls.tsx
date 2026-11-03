"use client";

import React from "react";
import { ChevronLeft, ChevronRight, BookOpen, Check } from "lucide-react";

interface GuideControlsProps {
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onGoToStep: (index: number) => void;
  onOpenDirectory: () => void;
}

/**
 * GuideControls
 * Single-responsibility component for rendering the modal navigation controls,
 * interactive step dots, Prev/Next buttons, and full directory link.
 */
export function GuideControls({
  stepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
  onGoToStep,
  onOpenDirectory,
}: GuideControlsProps) {
  return (
    <div className="pt-3 sm:pt-4 border-t border-slate-300/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
      {/* Mobile Top Row / Desktop Left & Center: Directory Trigger & Interactive Step Dots */}
      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenDirectory}
          className="text-xs font-bold text-slate-500 hover:text-[#ea5414] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">All Controls</span>
        </button>

        {/* Interactive Step Dots */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const isActive = idx === stepIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onGoToStep(idx)}
                aria-label={`Jump to step ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-6 sm:w-7 bg-[#ff6422] shadow-xs"
                    : "w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Prev & Next Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-end">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous step"
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 text-xs font-bold neu-btn rounded-full text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          aria-label={isLastStep ? "Complete tour" : "Next step"}
          className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 text-xs font-bold neu-btn-primary rounded-full text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
        >
          {isLastStep ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Complete Tour</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

