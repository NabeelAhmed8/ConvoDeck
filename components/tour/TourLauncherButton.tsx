"use client";

import React from "react";
import { Compass, HelpCircle } from "lucide-react";
import { START_TOUR_EVENT } from "@/hooks/useTourGuide";

interface TourLauncherButtonProps {
  variant?: "sidebar" | "settings" | "pill";
  isCollapsed?: boolean;
}

export function TourLauncherButton({
  variant = "sidebar",
  isCollapsed = false,
}: TourLauncherButtonProps) {
  const triggerTour = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(START_TOUR_EVENT));
    }
  };

  if (variant === "settings") {
    return (
      <button
        type="button"
        onClick={triggerTour}
        className="px-4 py-2 text-xs font-semibold rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
      >
        <Compass className="w-4 h-4 text-blue-600" aria-hidden="true" />
        Restart Tour Guide
      </button>
    );
  }

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={triggerTour}
        title="Interactive Tour Guide"
        aria-label="Interactive Tour Guide"
        className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full neu-btn text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
      >
        <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={triggerTour}
      aria-label="Start Interactive Product Tour"
      className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-white/60 neu-flat transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-2.5">
        <Compass className="w-4 h-4 text-blue-600 transition-transform group-hover:rotate-45" aria-hidden="true" />
        <span>Product Tour Guide</span>
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/50 font-bold">
        Help
      </span>
    </button>
  );
}
