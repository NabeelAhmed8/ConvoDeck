"use client";

import { useState, useEffect, useCallback } from "react";
import { TOUR_STEPS, ITourStep } from "@/constants/tourSteps";

const TOUR_STORAGE_KEY = "convodeck_tour_completed";
export const START_TOUR_EVENT = "convodeck:start-tour";
export const OPEN_DIRECTORY_EVENT = "convodeck:open-buttons-directory";

export function useTourGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep: ITourStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const totalSteps = TOUR_STEPS.length;

  const updateTargetRect = useCallback(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }
    const step = TOUR_STEPS[currentStepIndex];
    if (!step?.targetId) {
      setTargetRect(null);
      return;
    }
    const el = document.getElementById(step.targetId);
    if (el) {
      // Gently bring the element into view if partly offscreen
      try {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      } catch {}

      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
        return;
      }
    }
    setTargetRect(null);
  }, [isOpen, currentStepIndex]);

  // Update target rect on step change, resize or scroll
  useEffect(() => {
    updateTargetRect();
    const handleResize = () => updateTargetRect();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [updateTargetRect]);

  const markTourCompleted = useCallback(() => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {}
  }, []);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsDirectoryOpen(false);
    setIsOpen(true);
  }, []);

  const skipTour = useCallback(() => {
    markTourCompleted();
    setIsOpen(false);
  }, [markTourCompleted]);

  const completeTour = useCallback(() => {
    markTourCompleted();
    setIsOpen(false);
  }, [markTourCompleted]);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      completeTour();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
    }
  }, [isLastStep, completeTour]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
    }
  }, []);

  const openDirectory = useCallback(() => {
    setIsOpen(false);
    setIsDirectoryOpen(true);
  }, []);

  const closeDirectory = useCallback(() => {
    setIsDirectoryOpen(false);
  }, []);

  // Auto-launch for new users on initial mount
  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasCompleted) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Event listeners for tour & directory triggers
  useEffect(() => {
    const handleStartTour = () => startTour();
    const handleOpenDirectory = () => openDirectory();

    window.addEventListener(START_TOUR_EVENT, handleStartTour);
    window.addEventListener(OPEN_DIRECTORY_EVENT, handleOpenDirectory);
    return () => {
      window.removeEventListener(START_TOUR_EVENT, handleStartTour);
      window.removeEventListener(OPEN_DIRECTORY_EVENT, handleOpenDirectory);
    };
  }, [startTour, openDirectory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour();
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextStep, prevStep, skipTour]);

  return {
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
    completeTour,
    nextStep,
    prevStep,
    goToStep,
    openDirectory,
    closeDirectory,
  };
}
