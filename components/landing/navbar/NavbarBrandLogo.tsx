"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavbarBrandLogoProps {
  onNavigate?: () => void;
  className?: string;
}

/**
 * Single-responsibility component for the ConvoDeck brand logo in the navbar.
 * When clicked on the homepage, smoothly scrolls viewport to the very top without page refresh.
 * When clicked from any other page, navigates to the homepage root.
 */
export function NavbarBrandLogo({
  onNavigate,
  className = "",
}: NavbarBrandLogoProps) {
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();

    // If currently on the homepage, smoothly scroll to top without full page reload
    if (pathname === "/" || pathname === "") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      // Clear any URL section hash (e.g. #features, #pricing) cleanly without reload
      if (window.location.hash) {
        window.history.pushState(null, "", window.location.pathname);
      }
    }
  };

  return (
    <Link
      href="/"
      onClick={handleLogoClick}
      className={`flex items-center gap-2 sm:gap-3 group min-w-0 cursor-pointer select-none ${className}`}
      aria-label="ConvoDeck Home - Return to top"
    >
      <div
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl neu-convex flex items-center justify-center font-black text-slate-900 text-base sm:text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform"
        aria-hidden="true"
      >
        C
      </div>
      <div className="min-w-0">
        <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 block leading-none truncate group-hover:text-[#ff6422] transition-colors">
          ConvoDeck
        </span>
        <span className="text-[8.5px] sm:text-[10px] text-[#ff6422] font-semibold tracking-wider uppercase block mt-0.5 truncate">
          WhatsApp Sales CRM
        </span>
      </div>
    </Link>
  );
}

