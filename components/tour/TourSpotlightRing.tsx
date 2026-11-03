"use client";

import React from "react";

interface TourSpotlightRingProps {
  targetRect: DOMRect | null;
  onClose: () => void;
}

/**
 * TourSpotlightRing
 * Single-responsibility component for rendering the tactile Neumorphic
 * glowing target frame and dimming backdrop veil.
 */
export function TourSpotlightRing({ targetRect, onClose }: TourSpotlightRingProps) {
  const pad = 6;
  const top = targetRect ? Math.max(0, targetRect.top - pad) : -200;
  const left = targetRect ? Math.max(0, targetRect.left - pad) : -200;
  const width = targetRect ? targetRect.width + pad * 2 : 0;
  const height = targetRect ? targetRect.height + pad * 2 : 0;
  const borderRadius = targetRect ? Math.min(18, height / 2) : 16;

  return (
    <>
      {/* 1. Ambient Backdrop Dimming Veil */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[55] bg-slate-950/40 backdrop-blur-[1.5px] transition-opacity duration-300 cursor-pointer pointer-events-auto"
      />

      {/* 2. Tactile Neumorphic Target Spotlight Frame */}
      {targetRect && (
        <div
          aria-hidden="true"
          style={{
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: `${borderRadius}px`,
            border: "2.5px solid #ff6422",
            boxShadow:
              "0 0 24px rgba(255, 100, 34, 0.45), inset 0 0 12px rgba(255, 100, 34, 0.2)",
            transition:
              "top 0.25s cubic-bezier(0.16, 1, 0.3, 1), left 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s ease, height 0.25s ease",
          }}
          className="fixed pointer-events-none z-[58]"
        >
          {/* Pulsing Beacon Pill */}
          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6422] opacity-80" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ea5414] shadow-sm" />
          </span>
        </div>
      )}
    </>
  );
}

