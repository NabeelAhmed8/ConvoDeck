"use client";

import React from "react";

interface TourBackdropProps {
  targetRect: DOMRect | null;
  onClose: () => void;
}

export function TourBackdrop({ targetRect, onClose }: TourBackdropProps) {
  return (
    <div
      className="fixed inset-0 z-50 transition-opacity duration-300 pointer-events-auto"
      aria-hidden="true"
    >
      {/* Semi-transparent dark overlay with soft backdrop blur */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] cursor-pointer"
        onClick={onClose}
      />

      {/* Spotlight cutout highlight around target element if present */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-2xl transition-all duration-300 ease-out"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            boxShadow:
              "0 0 0 9999px rgba(15, 23, 42, 0.65), 0 0 20px 4px rgba(59, 130, 246, 0.5)",
            border: "2px solid rgba(96, 165, 250, 0.9)",
          }}
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
          </span>
        </div>
      )}
    </div>
  );
}
