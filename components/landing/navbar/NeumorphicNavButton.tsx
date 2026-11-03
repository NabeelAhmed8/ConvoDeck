"use client";

import React from "react";
import { NavItem } from "./navConfig";

interface NeumorphicNavButtonProps {
  item: NavItem;
  isActive: boolean;
  onSelect: (id: string) => void;
  variant?: "desktop" | "mobile";
}

/**
 * NeumorphicNavButton
 * Single-responsibility component for rendering an individual nav item
 * with tactile Neumorphic button elevation, hover lift, and active inset depression.
 */
export function NeumorphicNavButton({
  item,
  isActive,
  onSelect,
  variant = "desktop",
}: NeumorphicNavButtonProps) {
  const Icon = item.icon;

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-current={isActive ? "page" : undefined}
        className={`w-full text-left py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all duration-200 ${
          isActive ? "neu-nav-btn-active" : "neu-nav-btn"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <Icon
            className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
              isActive ? "scale-110" : ""
            }`}
          />
          <span>{item.label}</span>
        </span>

        {isActive && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ea5414]/10 text-[#ea5414]">
            Active
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? "page" : undefined}
      className={`relative px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer select-none ${
        isActive ? "neu-nav-btn-active" : "neu-nav-btn"
      }`}
    >
      <Icon
        className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
          isActive ? "scale-110" : ""
        }`}
      />
      <span>{item.label}</span>
    </button>
  );
}
