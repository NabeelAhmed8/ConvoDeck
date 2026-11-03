"use client";

import React from "react";
import { NavItem } from "./navConfig";
import { NeumorphicNavButton } from "./NeumorphicNavButton";

interface NavLinksDesktopProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * NavLinksDesktop
 * Renders the desktop navigation bar housing tactile Neumorphic buttons.
 */
export function NavLinksDesktop({ items, activeId, onSelect }: NavLinksDesktopProps) {
  return (
    <nav
      aria-label="Desktop Navigation"
      className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full neu-segmented-bar border border-white/80"
    >
      {items.map((item) => (
        <NeumorphicNavButton
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          onSelect={onSelect}
          variant="desktop"
        />
      ))}
    </nav>
  );
}
