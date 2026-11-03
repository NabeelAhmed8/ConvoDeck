"use client";

import React from "react";
import { NavItem } from "./navConfig";
import { NeumorphicNavButton } from "./NeumorphicNavButton";

interface NavLinksMobileProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * NavLinksMobile
 * Renders the mobile drawer navigation list using tactile Neumorphic buttons.
 */
export function NavLinksMobile({ items, activeId, onSelect }: NavLinksMobileProps) {
  return (
    <div className="flex flex-col space-y-2">
      {items.map((item) => (
        <NeumorphicNavButton
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          onSelect={onSelect}
          variant="mobile"
        />
      ))}
    </div>
  );
}
