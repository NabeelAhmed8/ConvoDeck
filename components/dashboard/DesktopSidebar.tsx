"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DashboardClientNav } from "@/components/dashboard/DashboardClientNav";
import { TourLauncherButton } from "@/components/tour/TourLauncherButton";
import { SidebarWhatsAppCard } from "@/components/dashboard/SidebarWhatsAppCard";
import { SidebarUserProfile } from "@/components/dashboard/SidebarUserProfile";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import { WorkspaceSummary } from "@/types";

interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userName: string;
  userEmail: string;
  userRole: string;
  workspaceName: string;
  whatsappNumber: string;
  initials: string;
  userAvatar?: string;
  isAgent: boolean;
  currentWorkspaceId?: string;
  userWorkspaces?: WorkspaceSummary[];
  onOpenAddLead: () => void;
}

export function DesktopSidebar({
  isCollapsed,
  onToggleCollapse,
  userName,
  userEmail,
  userRole,
  workspaceName,
  whatsappNumber,
  initials,
  userAvatar,
  isAgent,
  currentWorkspaceId,
  userWorkspaces = [],
  onOpenAddLead,
}: DesktopSidebarProps) {
  return (
    <aside
      aria-label="Main navigation sidebar"
      className={`hidden lg:flex flex-col neu-dribbble-rail text-slate-900 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
        isCollapsed
          ? "w-24 h-[calc(100vh-1.75rem)] my-3.5 ml-3.5 rounded-[36px] z-30"
          : "w-72 lg:w-80 h-[calc(100vh-1.75rem)] my-3.5 ml-3.5 rounded-[36px] shadow-[10px_10px_24px_rgba(166,180,200,0.45),-10px_-10px_24px_#ffffff] z-30"
      }`}
    >
      {/* Brand Header */}
      {isCollapsed ? (
        <div className="p-3 border-b-0 flex flex-col items-center gap-2">
          <Link
            id="tour-brand-header"
            href={isAgent ? "/agent/dashboard" : "/dashboard"}
            aria-label="ConvoDeck Dashboard Home"
            title="ConvoDeck Dashboard"
            className="w-12 h-12 rounded-full neu-convex flex items-center justify-center font-black text-slate-900 text-xl shadow-sm hover:scale-105 transition-transform"
          >
            C
          </Link>
          <button
            type="button"
            id="tour-btn-collapse"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar (Arrow Right)"
            title="Expand sidebar (Arrow Right key)"
            className="w-9 h-9 neu-btn rounded-full flex items-center justify-center text-slate-900 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-slate-900" />
          </button>
          <div className="neu-dribbble-divider my-1 w-full" aria-hidden="true" />
        </div>
      ) : (
        <div className="p-4 sm:p-5 border-b-0 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Link
              id="tour-brand-header"
              href={isAgent ? "/agent/dashboard" : "/dashboard"}
              aria-label="ConvoDeck Dashboard Home"
              className="flex items-center gap-3 min-w-0 group"
            >
              <div
                aria-hidden="true"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full neu-convex flex items-center justify-center font-black text-slate-900 text-lg sm:text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform"
              >
                C
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight block truncate group-hover:text-[#ff6422] transition-colors">
                  ConvoDeck
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block truncate">
                  {isAgent ? "Agent Workstation" : "WhatsApp CRM"}
                </span>
              </div>
            </Link>

            <button
              type="button"
              id="tour-btn-collapse"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar (Arrow Left)"
              title="Collapse sidebar (Arrow Left key)"
              className="w-9 h-9 neu-btn rounded-full flex items-center justify-center text-slate-900 transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-slate-900" />
            </button>
          </div>
          <div className="neu-dribbble-divider-full my-1" aria-hidden="true" />
        </div>
      )}

      {/* Dynamic Multi-Workspace Switcher */}
      <div
        className={
          isCollapsed ? "px-2 py-1 flex flex-col items-center" : "px-4 py-1"
        }
      >
        <WorkspaceSwitcher
          currentWorkspaceId={currentWorkspaceId}
          currentWorkspaceName={workspaceName}
          workspaces={userWorkspaces}
          isCollapsed={isCollapsed}
          isAgent={isAgent}
        />
        <div
          className={
            isCollapsed
              ? "neu-dribbble-divider my-2 w-full"
              : "neu-dribbble-divider-full my-2"
          }
          aria-hidden="true"
        />
      </div>

      {/* Dynamic Nav Links with Group Dividers */}
      <DashboardClientNav
        userRole={userRole}
        isCollapsed={isCollapsed}
        onOpenAddLead={onOpenAddLead}
      />

      {/* WhatsApp Business Connected Line Card */}
      <div className={isCollapsed ? "p-2 flex flex-col items-center" : "p-3 sm:p-4"}>
        <div
          className={isCollapsed ? "neu-dribbble-divider my-1.5 w-full" : "neu-dribbble-divider-full my-2"}
          aria-hidden="true"
        />
        <SidebarWhatsAppCard
          whatsappNumber={whatsappNumber}
          isAgent={isAgent}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Interactive Tour Guide Launcher */}
      <div className={isCollapsed ? "px-2 mb-1 flex justify-center" : "px-3 sm:px-4 mb-1"}>
        <TourLauncherButton isCollapsed={isCollapsed} />
      </div>

      {/* User Profile & Logout */}
      <SidebarUserProfile
        userName={userName}
        userEmail={userEmail}
        initials={initials}
        userAvatar={userAvatar}
        isAgent={isAgent}
        isCollapsed={isCollapsed}
      />
    </aside>
  );
}
