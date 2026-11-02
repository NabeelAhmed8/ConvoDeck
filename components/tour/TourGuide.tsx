"use client";

import React from "react";
import { useTourGuide } from "@/hooks/useTourGuide";
import { TourBackdrop } from "@/components/tour/TourBackdrop";
import { TourCard } from "@/components/tour/TourCard";
import { ButtonsDirectoryModal } from "@/components/tour/ButtonsDirectoryModal";

export function TourGuide() {
  const {
    isOpen,
    isDirectoryOpen,
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    targetRect,
    startTour,
    skipTour,
    nextStep,
    prevStep,
    goToStep,
    openDirectory,
    closeDirectory,
  } = useTourGuide();

  return (
    <>
      {/* 1. Step-by-Step Interactive Button Tour */}
      {isOpen && (
        <aside aria-label="Interactive Buttons Tour" className="relative z-50">
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
            onOpenDirectory={openDirectory}
          />
        </aside>
      )}

      {/* 2. Comprehensive Website Buttons Directory Modal */}
      <ButtonsDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={closeDirectory}
        onStartStepTour={startTour}
      />
    </>
  );
}
