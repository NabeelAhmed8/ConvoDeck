"use client";

import { useEffect } from "react";

/**
 * Global listener to dismiss floating desktop Chrome autofill overlays when the user scrolls with mouse wheel.
 * Completely disabled on touch / mobile devices because mobile software keypads cause viewport scrolls
 * and mobile browsers display autofill in the keyboard toolbar (never as floating detached windows).
 */
export function AutofillScrollDismiss() {
  useEffect(() => {
    // Detect touch / mobile device
    const isTouchDevice = () => {
      if (typeof window === "undefined") return false;
      return (
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
      );
    };

    // On mobile devices, never blur inputs on scroll:
    // Virtual keypads trigger automatic viewport adjustments when opening!
    if (isTouchDevice()) {
      return;
    }

    // On desktop, wheel scroll (mouse wheel / trackpad) can detach Chrome's native autofill dropdown.
    // Blurring the active input on wheel event cleanly dismisses the floating dropdown.
    const handleWheel = () => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        (active as HTMLElement).blur();
      }
    };

    window.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, []);

  return null;
}

