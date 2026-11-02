"use client";

import React from "react";
import { useTourGuide } from "@/hooks/useTourGuide";
import { TourBackdrop } from "@/components/tour/TourBackdrop";
import { TourCard } from "@/components/tour/TourCard";

export function TourGuide() {
  const {
    isOpen,
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    targetRect,
    skipTour,
    nextStep,
    prevStep,
    goToStep,
  } = useTourGuide();

  if (!isOpen) return null;

  return (
    <aside aria-label="Interactive Product Tour" className="relative z-50">
      <TourBackdrop targetRect={targetRect} onClose={skipTour} />
      <TourCard
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        targetRect={targetRect}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
        onGoToStep={goToStep}
      />
    </aside>
  );
}
