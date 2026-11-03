"use client";

import { useState, useEffect, useCallback } from "react";
import { GUIDE_STEPS } from "./guideStepsData";

const TOUR_STORAGE_KEY = "convodeck_guide_completed";
export const START_TOUR_EVENT = "convodeck:start-tour";
export const OPEN_DIRECTORY_EVENT = "convodeck:open-buttons-directory";

export function useTourPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const totalSteps = GUIDE_STEPS.length;
  const currentStep = GUIDE_STEPS[stepIndex] || GUIDE_STEPS[0];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const markCompleted = useCallback(() => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {}
  }, []);

  const openTour = useCallback(() => {
    setStepIndex(0);
    setIsDirectoryOpen(false);
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    markCompleted();
    setIsOpen(false);
  }, [markCompleted]);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      closeTour();
    } else {
      setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  }, [isLastStep, closeTour, totalSteps]);

  const prevStep = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setStepIndex(index);
    }
  }, [totalSteps]);

  const openDirectory = useCallback(() => {
    setIsOpen(false);
    setIsDirectoryOpen(true);
  }, []);

  const closeDirectory = useCallback(() => {
    setIsDirectoryOpen(false);
  }, []);

  // Listen to custom trigger events from anywhere on the platform
  useEffect(() => {
    const handleStart = () => openTour();
    const handleOpenDir = () => openDirectory();

    window.addEventListener(START_TOUR_EVENT, handleStart);
    window.addEventListener(OPEN_DIRECTORY_EVENT, handleOpenDir);
    return () => {
      window.removeEventListener(START_TOUR_EVENT, handleStart);
      window.removeEventListener(OPEN_DIRECTORY_EVENT, handleOpenDir);
    };
  }, [openTour, openDirectory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTour();
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextStep, prevStep, closeTour]);

  return {
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
  };
}

