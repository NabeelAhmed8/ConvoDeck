"use client";

import React from "react";
import { useTourPopup } from "./useTourPopup";
import { TourGuidePopup } from "./TourGuidePopup";
import { ButtonsDirectoryModal } from "./ButtonsDirectoryModal";

export function TourGuide() {
  const {
    isOpen,
    isDirectoryOpen,
    currentStep,
    stepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    openTour,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
    openDirectory,
    closeDirectory,
  } = useTourPopup();

  return (
    <>
      {/* 1. Centered Tactile Neumorphic Guide Popup */}
      <TourGuidePopup
        isOpen={isOpen}
        step={currentStep}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={nextStep}
        onPrev={prevStep}
        onClose={closeTour}
        onGoToStep={goToStep}
        onOpenDirectory={openDirectory}
      />

      {/* 2. Full Buttons Directory Reference Modal */}
      <ButtonsDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={closeDirectory}
        onStartStepTour={openTour}
      />
    </>
  );
}
