"use client";

import { useState, useEffect, useCallback } from "react";
import { TOUR_STEPS, ITourStep, isSidebarTourTarget } from "@/constants/tourSteps";
import { findVisibleTourElement } from "@/utils/tourElementFinder";

const TOUR_STORAGE_KEY = "convodeck_tour_completed";
export const START_TOUR_EVENT = "convodeck:start-tour";
export const OPEN_DIRECTORY_EVENT = "convodeck:open-buttons-directory";

export interface UseTourGuideOptions {
  onExpandMobileDrawer?: () => void;
  onCollapseMobileDrawer?: () => void;
  onExpandDesktopSidebar?: () => void;
}

export function useTourGuide(options?: UseTourGuideOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep: ITourStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const totalSteps = TOUR_STEPS.length;

  const measureTarget = useCallback(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }
    const step = TOUR_STEPS[currentStepIndex];
    if (!step?.targetId) {
      setTargetRect(null);
      return;
    }
    const el = findVisibleTourElement(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
        return;
      }
    }
    setTargetRect(null);
  }, [isOpen, currentStepIndex]);

  // Synchronize sidebar expansion/collapse based on target button location
  useEffect(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    const isSidebar = isSidebarTourTarget(step.targetId);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    if (isSidebar) {
      if (isMobile) {
        options?.onExpandMobileDrawer?.();
      } else {
        options?.onExpandDesktopSidebar?.();
      }
    } else {
      if (isMobile) {
        options?.onCollapseMobileDrawer?.();
      }
    }
  }, [isOpen, currentStepIndex, options]);

  // Smooth 60fps tracking loop when step changes or scrolling happens
  useEffect(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }

    const step = TOUR_STEPS[currentStepIndex];
    const el = step?.targetId ? findVisibleTourElement(step.targetId) : null;

    if (el) {
      const rect = el.getBoundingClientRect();
      const isOutOfView =
        rect.top < 20 ||
        rect.bottom > window.innerHeight - 20 ||
        rect.left < 0 ||
        rect.right > window.innerWidth;

      if (isOutOfView) {
        try {
          el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        } catch {}
      }
    }

    let animId: number;
    const startTime = performance.now();
    const duration = 450;

    const trackFrame = () => {
      measureTarget();
      if (performance.now() - startTime < duration) {
        animId = requestAnimationFrame(trackFrame);
      }
    };

    animId = requestAnimationFrame(trackFrame);

    const handleResizeOrScroll = () => measureTarget();
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [isOpen, currentStepIndex, measureTarget]);

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
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (isMobile) {
      options?.onCollapseMobileDrawer?.();
    }
    setIsOpen(false);
  }, [markTourCompleted, options]);

  const completeTour = useCallback(() => {
    markTourCompleted();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (isMobile) {
      options?.onCollapseMobileDrawer?.();
    }
    setIsOpen(false);
  }, [markTourCompleted, options]);

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

  // Listen for trigger events
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
