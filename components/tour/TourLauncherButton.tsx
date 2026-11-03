"use client";

import React from "react";
import { Compass, BookOpen } from "lucide-react";
import { START_TOUR_EVENT, OPEN_DIRECTORY_EVENT } from "@/hooks/useTourGuide";

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

  const triggerDirectory = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(OPEN_DIRECTORY_EVENT));
    }
  };

  if (variant === "settings") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={triggerTour}
          className="px-4 py-2 text-xs font-semibold rounded-2xl neu-btn-primary text-white transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
        >
          <Compass className="w-4 h-4 text-white" aria-hidden="true" />
          Start Button Tour
        </button>
        <button
          type="button"
          onClick={triggerDirectory}
          className="px-4 py-2 text-xs font-semibold rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <BookOpen className="w-4 h-4 text-slate-600" aria-hidden="true" />
          All Buttons Guide
        </button>
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <button
        type="button"
        id="tour-btn-launcher"
        onClick={triggerTour}
        title="Website Buttons Guide"
        aria-label="Website Buttons Guide"
        className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full neu-btn text-slate-700 hover:text-[#ea5414] transition-colors cursor-pointer"
      >
        <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div id="tour-btn-launcher" className="w-full flex items-center gap-1.5">
      <button
        type="button"
        onClick={triggerTour}
        aria-label="Start Website Buttons Tour"
        className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-700 hover:text-[#ea5414] hover:bg-white/60 neu-flat transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-[#ea5414] transition-transform group-hover:rotate-45" aria-hidden="true" />
          <span>Buttons Tour</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#ff6422]/10 text-[#ea5414] border border-[#ff6422]/30 font-bold">
          Guide
        </span>
      </button>

      <button
        type="button"
        onClick={triggerDirectory}
        title="Open Full Buttons Directory"
        aria-label="Open Full Buttons Directory"
        className="w-8 h-8 rounded-xl flex items-center justify-center neu-btn text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
      >
        <BookOpen className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
