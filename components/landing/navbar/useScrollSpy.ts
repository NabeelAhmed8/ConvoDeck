"use client";

import { useState, useEffect, useCallback } from "react";

export function useScrollSpy(sectionIds: string[], defaultId = "") {
  const [activeId, setActiveId] = useState<string>(defaultId);

  const handleScroll = useCallback(() => {
    // If near page top, set default
    if (window.scrollY < 120) {
      setActiveId(defaultId);
      return;
    }

    const scrollPosition = window.scrollY + 200;

    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const id = sectionIds[i];
      const element = document.getElementById(id);
      if (element) {
        const top = element.offsetTop;
        if (scrollPosition >= top) {
          setActiveId(id);
          return;
        }
      }
    }
  }, [sectionIds, defaultId]);

  useEffect(() => {
    handleScroll();
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 90;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - topOffset),
        behavior: "smooth",
      });
    }
  };

  return { activeId, scrollTo };
}

