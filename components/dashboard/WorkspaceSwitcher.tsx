"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronsUpDown,
  Plus,
  Settings,
  Building2,
} from "lucide-react";
import { WorkspaceSummary } from "@/types";
import { switchActiveWorkspace } from "@/actions/workspaceActions";
import { WorkspaceDropdownItem } from "@/components/dashboard/WorkspaceDropdownItem";
import { CreateWorkspaceModal } from "@/components/dashboard/CreateWorkspaceModal";

export interface WorkspaceSwitcherProps {
  currentWorkspaceId?: string;
  currentWorkspaceName: string;
  workspaces?: WorkspaceSummary[];
  isCollapsed?: boolean;
  isAgent?: boolean;
  onNavigate?: () => void;
}

/**
 * Single-responsibility component for viewing, switching, and creating workspaces.
 * Follows SaaS industry standards (e.g. Slack, Notion, Stripe) with tactile Neumorphic styling.
 */
export function WorkspaceSwitcher({
  currentWorkspaceId,
  currentWorkspaceName,
  workspaces = [],
  isCollapsed = false,
  isAgent = false,
  onNavigate,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSwitch = async (workspaceId: string) => {
    if (workspaceId === currentWorkspaceId) {
      setIsOpen(false);
      return;
    }

    setSwitchingId(workspaceId);
    try {
      const res = await switchActiveWorkspace(workspaceId);
      if (res.success) {
        if (onNavigate) onNavigate();
        // Reload page to re-render all Server Components with new active workspace context
        window.location.reload();
      } else {
        alert(res.error || "Failed to switch workspace.");
        setSwitchingId(null);
      }
    } catch {
      alert("An unexpected error occurred while switching workspace.");
      setSwitchingId(null);
    }
  };

  const initial = currentWorkspaceName.substring(0, 1).toUpperCase();
  const twoLetters = currentWorkspaceName.substring(0, 2).toUpperCase();

  // Ensure current workspace is present in the list even if initially empty
  const displayWorkspaces = workspaces.length > 0
    ? workspaces
    : [
        {
          id: currentWorkspaceId || "default",
          name: currentWorkspaceName,
          plan: "trial",
          planStatus: "trial",
          isCurrent: true,
          role: isAgent ? "Agent" : "Owner",
        },
      ];

  return (
    <>
      <div ref={containerRef} className="relative w-full">
        {/* Trigger Button: Collapsed mode */}
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={`Current Workspace: ${currentWorkspaceName}. Click to switch.`}
            title={`Workspace: ${currentWorkspaceName} (Click to switch)`}
            aria-expanded={isOpen}
            className="w-12 h-12 neu-convex rounded-full flex items-center justify-center text-xs font-bold text-slate-900 hover:scale-105 transition-all relative group cursor-pointer"
          >
            <span>{twoLetters}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
        ) : (
          /* Trigger Button: Expanded mode */
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={`Current Workspace: ${currentWorkspaceName}. Click to switch.`}
            aria-expanded={isOpen}
            className="w-full p-2.5 neu-convex rounded-2xl flex items-center justify-between text-xs sm:text-sm transition-all group cursor-pointer hover:shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                aria-hidden="true"
                className="w-7 h-7 rounded-full bg-slate-900/10 text-slate-900 font-bold flex items-center justify-center text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform"
              >
                {initial}
              </div>
              <div className="min-w-0 text-left">
                <span className="font-bold text-slate-900 block truncate group-hover:text-[#ff6422] transition-colors">
                  {currentWorkspaceName}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block truncate">
                  Switch Workspace
                </span>
              </div>
            </div>
            <ChevronsUpDown
              className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-slate-900 transition-colors"
              aria-hidden="true"
            />
          </button>
        )}

        {/* Dropdown Menu Popover */}
        {isOpen && (
          <div
            role="menu"
            aria-label="Workspace Switcher Menu"
            className={`absolute z-50 p-2.5 neu-card rounded-3xl bg-[#edf1f7] text-slate-900 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-150 ${
              isCollapsed
                ? "left-full top-0 ml-3 w-72"
                : "top-full left-0 right-0 mt-2 w-full min-w-[260px]"
            }`}
          >
            {/* Dropdown Header */}
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Workspaces ({displayWorkspaces.length})
              </span>
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* List of Workspaces */}
            <div className="space-y-1 max-h-56 overflow-y-auto chat-scrollbar my-1">
              {displayWorkspaces.map((ws) => (
                <WorkspaceDropdownItem
                  key={ws.id}
                  workspace={ws}
                  isSwitching={switchingId === ws.id}
                  onSelect={handleSwitch}
                />
              ))}
            </div>

            <div className="neu-dribbble-divider-full my-2" aria-hidden="true" />

            {/* Actions: Add Workspace + Settings */}
            <div className="space-y-1">
              {!isAgent && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (onNavigate) onNavigate();
                    setIsModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#ff6422]" />
                  <span>Create New Workspace</span>
                </button>
              )}

              <Link
                href={isAgent ? "/agent/dashboard" : "/settings"}
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigate) onNavigate();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Workspace Settings</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modal for creating a brand-new workspace */}
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          if (onNavigate) onNavigate();
          window.location.href = "/dashboard";
        }}
      />
    </>
  );
}

