"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface ShowcaseTopControlsProps {
  currentIndex: number;
  total: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
}

export function ShowcaseTopControls({
  currentIndex,
  total,
  onSelect,
  onPrev,
  onNext,
  isAutoPlaying,
  onToggleAutoPlay,
}: ShowcaseTopControlsProps) {
  const formattedIndex = String(currentIndex + 1).padStart(2, "0");
  const formattedTotal = String(total).padStart(2, "0");

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Interactive Scenario Dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              aria-label={`View deal scenario ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? "w-6 h-2 bg-[#ff6422] shadow-xs"
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          );
        })}

        <button
          type="button"
          onClick={onToggleAutoPlay}
          aria-label={isAutoPlaying ? "Pause deal rotation" : "Play deal rotation"}
          className="ml-1 p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          {isAutoPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
        </button>
      </div>

      {/* Slide Counter & Arrow Nav */}
      <div className="flex items-center gap-1.5">
        <div className="neu-convex px-2.5 py-1 rounded-xl text-right">
          <span className="font-mono text-xs font-bold text-slate-800">
            {formattedIndex} <span className="text-slate-400 font-normal">/ {formattedTotal}</span>
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous deal scenario"
            className="w-6 h-6 rounded-lg neu-btn flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next deal scenario"
            className="w-6 h-6 rounded-lg neu-btn flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

