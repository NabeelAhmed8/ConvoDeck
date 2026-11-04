"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { DashboardClientNav } from "@/components/dashboard/DashboardClientNav";
import { TourLauncherButton } from "@/components/tour/TourLauncherButton";
import { SidebarWhatsAppCard } from "@/components/dashboard/SidebarWhatsAppCard";
import { SidebarUserProfile } from "@/components/dashboard/SidebarUserProfile";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import { WorkspaceSummary } from "@/types";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

export function MobileDrawer({
  isOpen,
  onClose,
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
}: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-over Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Main Navigation Menu"
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] h-full neu-dribbble-rail bg-[#edf1f7] text-slate-900 flex flex-col shadow-2xl transition-transform duration-300 ease-out transform overflow-y-auto chat-scrollbar ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer Header: Brand + Close button */}
        <div className="p-4 sm:p-5 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <Link
              id="tour-brand-header"
              href={isAgent ? "/agent/dashboard" : "/dashboard"}
              aria-label="ConvoDeck Dashboard Home"
              onClick={onClose}
              className="flex items-center gap-3 min-w-0 group"
            >
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-full neu-convex flex items-center justify-center font-black text-slate-900 text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform"
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
              onClick={onClose}
              aria-label="Close navigation menu"
              className="w-8 h-8 sm:w-9 sm:h-9 neu-btn rounded-full flex items-center justify-center text-slate-900 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 text-slate-900" aria-hidden="true" />
            </button>
          </div>
          <div className="neu-dribbble-divider-full my-1" aria-hidden="true" />
        </div>

        {/* Dynamic Multi-Workspace Switcher */}
        <div className="px-4 py-1 shrink-0">
          <WorkspaceSwitcher
            currentWorkspaceId={currentWorkspaceId}
            currentWorkspaceName={workspaceName}
            workspaces={userWorkspaces}
            isCollapsed={false}
            isAgent={isAgent}
            onNavigate={onClose}
          />
          <div className="neu-dribbble-divider-full my-2" aria-hidden="true" />
        </div>

        {/* Navigation Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <DashboardClientNav
            userRole={userRole}
            isCollapsed={false}
            onNavigate={onClose}
            onOpenAddLead={onOpenAddLead}
          />
        </div>

        {/* WhatsApp Business Live Card */}
        <div className="p-3 sm:p-4 shrink-0">
          <div className="neu-dribbble-divider-full my-1.5" aria-hidden="true" />
          <SidebarWhatsAppCard
            whatsappNumber={whatsappNumber}
            isAgent={isAgent}
            isCollapsed={false}
            onNavigate={onClose}
          />
        </div>

        {/* Interactive Tour Guide */}
        <div className="px-3 sm:px-4 py-2 border-t border-slate-200/50">
          <TourLauncherButton
            variant="sidebar"
            isCollapsed={false}
          />
        </div>

        {/* User Profile & Logout */}
        <div className="border-t border-slate-200/50">
          <SidebarUserProfile
            userName={userName}
            userEmail={userEmail}
            initials={initials}
            userAvatar={userAvatar}
            isAgent={isAgent}
            isCollapsed={false}
            onNavigate={onClose}
          />
        </div>
      </div>
    </>
  );
}
