"use client";

import React from "react";
import { IGuideStep } from "./guideStepsData";
import { GuideHeader } from "./GuideHeader";
import { GuideStepContent } from "./GuideStepContent";
import { GuideControls } from "./GuideControls";

interface TourGuidePopupProps {
  isOpen: boolean;
  step: IGuideStep;
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onGoToStep: (index: number) => void;
  onOpenDirectory: () => void;
}

/**
 * TourGuidePopup
 * Single-responsibility component for rendering the centered,
 * tactile Neumorphic platform walkthrough popup modal.
 */
export function TourGuidePopup({
  isOpen,
  step,
  stepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
  onClose,
  onGoToStep,
  onOpenDirectory,
}: TourGuidePopupProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ConvoDeck Platform Feature Guide"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 pointer-events-auto"
    >
      {/* Click outside backdrop overlay to dismiss */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 cursor-pointer"
      />

      {/* Tactile Neumorphic Central Popup Card */}
      <div className="relative z-10 w-full max-w-2xl bg-[#edf1f7] rounded-3xl sm:rounded-[32px] p-5 sm:p-7 border border-white/90 shadow-[14px_14px_35px_rgba(166,178,196,0.5),-12px_-12px_35px_#ffffff] text-slate-900 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Top Header */}
        <GuideHeader
          step={step}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onClose={onClose}
        />

        {/* Feature Narrative & Highlights */}
        <GuideStepContent
          step={step}
          onNavigate={onClose}
        />

        {/* Navigation & Jump Controls */}
        <GuideControls
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={onNext}
          onPrev={onPrev}
          onGoToStep={onGoToStep}
          onOpenDirectory={onOpenDirectory}
        />
      </div>
    </div>
  );
}

