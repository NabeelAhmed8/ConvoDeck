"use client";

import React from "react";
import Link from "next/link";
import { Globe, ArrowUpRight } from "lucide-react";

export interface VisitWebsiteLinkProps {
  isCollapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

/**
 * Single-responsibility component for navigating from the dashboard back to the public homepage.
 * Renders as a tactile circular Neumorphic icon button when sidebar is collapsed,
 * and as an interactive row with Globe and ArrowUpRight (↗) when expanded.
 */
export function VisitWebsiteLink({
  isCollapsed = false,
  onNavigate,
  className = "",
}: VisitWebsiteLinkProps) {
  if (isCollapsed) {
    return (
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        title="Visit Website ↗ (Homepage)"
        aria-label="Visit Website ↗ (Homepage)"
        className={`group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full neu-btn text-slate-800 hover:text-[#ff6422] transition-all duration-200 cursor-pointer shadow-xs hover:scale-105 ${className}`}
      >
        <Globe
          className="w-5 h-5 text-slate-800 group-hover:text-[#ff6422] transition-colors"
          aria-hidden="true"
        />
        <span className="sr-only">Visit Website</span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      title="Visit Website ↗ (Homepage)"
      aria-label="Visit Website ↗ (Homepage)"
      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 neu-btn transition-all duration-200 cursor-pointer shadow-xs ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Globe
          className="w-4 h-4 text-slate-700 group-hover:text-[#ff6422] transition-colors shrink-0"
          aria-hidden="true"
        />
        <span className="truncate">Visit Website</span>
      </div>
      <ArrowUpRight
        className="w-4 h-4 text-slate-400 group-hover:text-[#ff6422] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
        aria-hidden="true"
      />
    </Link>
  );
}

