"use client";

import React from "react";

interface TourBackdropProps {
  targetRect: DOMRect | null;
  onClose: () => void;
}

export function TourBackdrop({ targetRect, onClose }: TourBackdropProps) {
  const pad = 6;
  const rx = 16;

  const cutoutX = targetRect ? Math.max(0, targetRect.left - pad) : -200;
  const cutoutY = targetRect ? Math.max(0, targetRect.top - pad) : -200;
  const cutoutW = targetRect ? targetRect.width + pad * 2 : 0;
  const cutoutH = targetRect ? targetRect.height + pad * 2 : 0;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto overflow-hidden"
      aria-hidden="true"
    >
      {/* Clickable backdrop overlay to dismiss */}
      <div
        onClick={onClose}
        className="absolute inset-0 cursor-pointer"
        aria-label="Close tour overlay"
      />

      {/* GPU-accelerated SVG Cutout Mask */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White background reveals the darkened overlay */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black rounded rectangle cuts out the spotlight hole */}
            <rect
              x={cutoutX}
              y={cutoutY}
              width={cutoutW}
              height={cutoutH}
              rx={rx}
              ry={rx}
              fill="black"
              className="transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
          </mask>
        </defs>

        {/* Semi-transparent dark overlay through the cutout mask */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.65)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Glowing neon spotlight ring smoothly tracking target button */}
      {targetRect && (
        <div
          className="fixed pointer-events-none transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] z-10"
          style={{
            top: `${cutoutY}px`,
            left: `${cutoutX}px`,
            width: `${cutoutW}px`,
            height: `${cutoutH}px`,
            borderRadius: `${rx}px`,
            border: "2.5px solid rgba(255, 100, 34, 0.95)",
            boxShadow:
              "0 0 25px rgba(255, 100, 34, 0.5), inset 0 0 12px rgba(255, 100, 34, 0.2)",
          }}
        >
          {/* Animated beacon badge */}
          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6422] opacity-80" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ea5414] shadow-sm" />
          </span>
        </div>
      )}
    </div>
  );
}
