"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";
import { WorkspaceSummary } from "@/types";

export interface WorkspaceDropdownItemProps {
  workspace: WorkspaceSummary;
  isSwitching: boolean;
  onSelect: (workspaceId: string) => void;
}

/**
 * Single-responsibility component for rendering an individual workspace
 * entry within the Workspace Switcher dropdown menu.
 */
export function WorkspaceDropdownItem({
  workspace,
  isSwitching,
  onSelect,
}: WorkspaceDropdownItemProps) {
  const initial = workspace.name.substring(0, 1).toUpperCase();
  const planLabel = workspace.plan.toUpperCase();

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "enterprise":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "growth":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "starter":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(workspace.id)}
      disabled={workspace.isCurrent || isSwitching}
      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
        workspace.isCurrent
          ? "neu-pressed bg-[#e4eaf2] text-slate-900 font-bold"
          : "hover:bg-slate-200/50 text-slate-700 hover:text-slate-900"
      } ${isSwitching ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          aria-hidden="true"
          className="w-8 h-8 rounded-xl neu-convex flex items-center justify-center font-bold text-xs text-slate-900 shrink-0"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <span className="block text-xs sm:text-sm font-bold truncate">
            {workspace.name}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold border ${getPlanBadgeColor(
                workspace.plan
              )}`}
            >
              {planLabel}
            </span>
            {workspace.role && (
              <span className="text-[10px] text-slate-500 font-medium">
                • {workspace.role}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 ml-2">
        {isSwitching ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#ff6422]" />
        ) : workspace.isCurrent ? (
          <Check className="w-4 h-4 text-[#ff6422] font-black stroke-[3]" />
        ) : null}
      </div>
    </button>
  );
}

