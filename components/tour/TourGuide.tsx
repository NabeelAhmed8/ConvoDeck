"use client";

import React from "react";
import { useNeumorphicTour } from "./useNeumorphicTour";
import { TourSpotlightRing } from "./TourSpotlightRing";
import { TourCard } from "./TourCard";
import { ButtonsDirectoryModal } from "./ButtonsDirectoryModal";
import { TourGuideProps } from "./tourTypes";

export function TourGuide({
  onExpandMobileDrawer,
  onCollapseMobileDrawer,
  onExpandDesktopSidebar,
}: TourGuideProps = {}) {
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
  } = useNeumorphicTour({
    onExpandMobileDrawer,
    onCollapseMobileDrawer,
    onExpandDesktopSidebar,
  });

  return (
    <>
      {/* 1. Neumorphic Spotlight Overlay & Floating Card */}
      {isOpen && (
        <aside aria-label="Interactive Website Tour">
          <TourSpotlightRing targetRect={targetRect} onClose={skipTour} />
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

      {/* 2. Full Buttons Directory Modal */}
      <ButtonsDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={closeDirectory}
        onStartStepTour={startTour}
      />
    </>
  );
}
