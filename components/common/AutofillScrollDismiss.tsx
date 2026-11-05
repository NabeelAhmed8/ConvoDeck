"use client";

import { useEffect } from "react";

/**
 * Global scroll listener to dismiss Chrome native autofill overlay on scroll.
 * When the user scrolls any container, if an input or textarea is active, it blurs it,
 * preventing Chrome's native autofill popup from lingering or scrolling awkwardly.
 */
export function AutofillScrollDismiss() {
  useEffect(() => {
    const handleScroll = () => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        (active as HTMLElement).blur();
      }
    };
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  return null;
}

