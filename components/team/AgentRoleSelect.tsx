"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Headphones,
  BarChart3,
  ShieldCheck,
  Check,
} from "lucide-react";
import { UserRole } from "@/types";

export interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  badge: string;
  icon: React.ElementType;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "agent",
    title: "Sales Agent",
    description: "WhatsApp inbox & sales pipeline access only",
    badge: "Standard",
    icon: Headphones,
  },
  {
    id: "manager",
    title: "Team Manager",
    description: "Pipeline, team analytics & audit activity reports",
    badge: "Manager",
    icon: BarChart3,
  },
  {
    id: "admin",
    title: "Administrator",
    description: "Full workspace, billing & API management",
    badge: "Full Access",
    icon: ShieldCheck,
  },
];

interface AgentRoleSelectProps {
  id?: string;
  value: UserRole;
  onChange: (val: UserRole) => void;
  disabled?: boolean;
}

/**
 * AgentRoleSelect
 * Single-responsibility component for rendering a custom, tactile neumorphic
 * dynamic role dropdown menu with icon badges and permission descriptions.
 */
export function AgentRoleSelect({
  id = "agent-role-select",
  value,
  onChange,
  disabled = false,
}: AgentRoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRole =
    ROLE_OPTIONS.find((r) => r.id === value) || ROLE_OPTIONS[0];
  const SelectedIcon = selectedRole.icon;

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key listener to close dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (roleId: UserRole) => {
    onChange(roleId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Accessible native select associated with label for 100% WCAG compliance */}
      <select
        id={id}
        name="agentRole"
        aria-label="Select Agent Role"
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        className="sr-only"
        tabIndex={-1}
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.title} ({opt.badge})
          </option>
        ))}
      </select>

      {/* Trigger Button */}
      <button
        type="button"
        id={`${id}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select agent role: currently ${selectedRole.title}`}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-xs neu-input rounded-xl text-slate-900 font-semibold focus:outline-none flex items-center justify-between gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-white/70 hover:bg-white"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-lg neu-convex flex items-center justify-center text-[#ff6422] shrink-0">
            <SelectedIcon className="w-3 h-3" />
          </div>
          <span className="truncate">{selectedRole.title}</span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#ff6422]" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dynamic Neumorphic Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby="agent-role-select-trigger"
          className="absolute top-full mt-1.5 inset-x-0 z-50 neu-card rounded-2xl bg-[#edf1f7] border border-white/90 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
        >
          {ROLE_OPTIONS.map((option) => {
            const isSelected = option.id === value;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.id)}
                className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? "neu-pressed bg-white text-slate-900 border border-orange-200/50"
                    : "hover:bg-white/80 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg neu-convex flex items-center justify-center shrink-0 ${
                      isSelected ? "text-[#ff6422]" : "text-slate-600"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold leading-tight truncate">
                        {option.title}
                      </p>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-200/60 text-slate-600">
                        {option.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <Check
                    className="w-3.5 h-3.5 text-[#ff6422] shrink-0 mr-1"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
