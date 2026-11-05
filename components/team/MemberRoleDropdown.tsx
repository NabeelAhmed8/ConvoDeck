"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { ROLE_OPTIONS } from "@/components/team/AgentRoleSelect";
import { UserRole } from "@/types";

export interface MemberRoleDropdownProps {
  memberId: string;
  memberName: string;
  currentRole: UserRole;
  isAdmin: boolean;
  isSelf: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onRoleChange: (newRole: UserRole) => void;
}

/**
 * MemberRoleDropdown
 * Single-responsibility component for rendering a tactile Neumorphic dropdown
 * allowing workspace administrators to seamlessly change a team member's RBAC role.
 */
export function MemberRoleDropdown({
  memberId,
  memberName,
  currentRole,
  isAdmin,
  isSelf,
  isLoading = false,
  disabled = false,
  onRoleChange,
}: MemberRoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedRoleOption =
    ROLE_OPTIONS.find((r) => r.id === currentRole) || ROLE_OPTIONS[0];
  const CurrentIcon = selectedRoleOption.icon;

  const canEdit = isAdmin && !isSelf && !disabled && !isLoading;

  // Toggle dropdown with smart viewport position detection
  const handleToggle = () => {
    if (!canEdit) return;

    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 230);
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Dismiss dropdown on window or container scroll to eliminate floating detachment
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const handleSelectRole = (newRole: UserRole) => {
    setIsOpen(false);
    if (newRole !== currentRole) {
      onRoleChange(newRole);
    }
  };

  // Color tokens per role
  const getBadgeClasses = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200/80 hover:border-purple-300";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200/80 hover:border-blue-300";
      case "agent":
      default:
        return "bg-orange-100 text-[#ea5414] border-orange-200/80 hover:border-orange-300";
    }
  };

  // Read-only badge if user is not authorized or viewing self
  if (!canEdit) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors ${getBadgeClasses(
          currentRole
        )}`}
        title={
          isSelf
            ? "Your own administrator role cannot be altered here"
            : !isAdmin
            ? "Only workspace administrators can alter team roles"
            : undefined
        }
      >
        <CurrentIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{selectedRoleOption.title}</span>
        {isSelf && (
          <span className="text-[10px] opacity-75 font-medium">(You)</span>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Neumorphic Interactive Role Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={`role-trigger-${memberId}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change role for ${memberName}: currently ${selectedRoleOption.title}`}
        onClick={handleToggle}
        disabled={isLoading}
        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-[1.02] active:scale-[0.98] ${getBadgeClasses(
          currentRole
        )}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#ff6422]" />
        ) : (
          <CurrentIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        )}

        <span>{selectedRoleOption.title}</span>

        <ChevronDown
          className={`w-3 h-3 text-slate-500 group-hover:text-slate-800 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dynamic Tactile Neumorphic Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={`role-trigger-${memberId}`}
          className={`absolute ${
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } left-0 z-50 w-64 neu-card rounded-2xl bg-[#edf1f7] border border-white/90 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200/60 pb-1 mb-1">
            Assign Role (RBAC)
          </div>

          {ROLE_OPTIONS.map((option) => {
            const isSelected = option.id === currentRole;
            const OptionIcon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectRole(option.id)}
                className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? "neu-pressed bg-white text-slate-900 border border-orange-200/50 shadow-2xs"
                    : "hover:bg-white/80 text-slate-700 hover:shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg neu-convex flex items-center justify-center shrink-0 ${
                      isSelected ? "text-[#ff6422]" : "text-slate-600"
                    }`}
                  >
                    <OptionIcon className="w-3.5 h-3.5" />
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

