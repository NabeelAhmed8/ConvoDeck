"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TOUR_STEPS, isSidebarTarget } from "./tourData";
import { ITourStep, TourGuideProps } from "./tourTypes";
import { findVisibleTourElement } from "@/utils/tourElementFinder";

const TOUR_STORAGE_KEY = "convodeck_tour_completed";
export const START_TOUR_EVENT = "convodeck:start-tour";
export const OPEN_DIRECTORY_EVENT = "convodeck:open-buttons-directory";

export function useNeumorphicTour({
  onExpandMobileDrawer,
  onCollapseMobileDrawer,
  onExpandDesktopSidebar,
}: TourGuideProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep: ITourStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const totalSteps = TOUR_STEPS.length;

  const animFrameRef = useRef<number | null>(null);

  // Measure visible target position
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

  // Handle drawer/sidebar expansion & smooth centering when step changes
  useEffect(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    const isSidebar = isSidebarTarget(step.targetId);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    // 1. Expand sidebar/drawer if target lives inside it
    if (isSidebar) {
      if (isMobile) {
        onExpandMobileDrawer?.();
      } else {
        onExpandDesktopSidebar?.();
      }
    } else {
      // If outside sidebar (e.g. dashboard quick actions), close mobile drawer so user sees it
      if (isMobile) {
        onCollapseMobileDrawer?.();
      }
    }

    // 2. Smoothly scroll target into center of its view (including inner overflow-y-auto containers)
    const scrollTimer = setTimeout(() => {
      const el = findVisibleTourElement(step.targetId);
      if (el) {
        try {
          el.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        } catch {
          el.scrollIntoView();
        }
      }
    }, 60);

    // 3. Track position smoothly across the 400ms transition/scroll window
    const startTime = performance.now();
    const duration = 500;

    const trackLoop = () => {
      measureTarget();
      if (performance.now() - startTime < duration) {
        animFrameRef.current = requestAnimationFrame(trackLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(trackLoop);

    return () => {
      clearTimeout(scrollTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isOpen,
    currentStepIndex,
    onExpandMobileDrawer,
    onCollapseMobileDrawer,
    onExpandDesktopSidebar,
    measureTarget,
  ]);

  // Listen to capture-phase scroll events from window AND inner overflow-y-auto containers
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => measureTarget();

    // { capture: true } is crucial to catch scrolling inside inner sidebar containers!
    window.addEventListener("scroll", handleUpdate, { capture: true, passive: true });
    window.addEventListener("resize", handleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, measureTarget]);

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
      onCollapseMobileDrawer?.();
    }
    setIsOpen(false);
  }, [markTourCompleted, onCollapseMobileDrawer]);

  const completeTour = useCallback(() => {
    markTourCompleted();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (isMobile) {
      onCollapseMobileDrawer?.();
    }
    setIsOpen(false);
  }, [markTourCompleted, onCollapseMobileDrawer]);

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

  // Listen for trigger events
  useEffect(() => {
    const handleStart = () => startTour();
    const handleOpenDir = () => openDirectory();

    window.addEventListener(START_TOUR_EVENT, handleStart);
    window.addEventListener(OPEN_DIRECTORY_EVENT, handleOpenDir);
    return () => {
      window.removeEventListener(START_TOUR_EVENT, handleStart);
      window.removeEventListener(OPEN_DIRECTORY_EVENT, handleOpenDir);
    };
  }, [startTour, openDirectory]);

  // Keyboard navigation: ArrowRight / ArrowLeft / Escape
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

