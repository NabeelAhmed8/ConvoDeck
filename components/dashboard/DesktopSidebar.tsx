"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DashboardClientNav } from "@/components/dashboard/DashboardClientNav";
import { TourLauncherButton } from "@/components/tour/TourLauncherButton";
import { logoutUser } from "@/actions/authActions";

interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userName: string;
  userEmail: string;
  userRole: string;
  workspaceName: string;
  whatsappNumber: string;
  initials: string;
  isAgent: boolean;
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
  isAgent,
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
            href={isAgent ? "/agent/dashboard" : "/dashboard"}
            aria-label="ConvoDeck Dashboard Home"
            title="ConvoDeck Dashboard"
            className="w-12 h-12 rounded-full neu-convex flex items-center justify-center font-black text-slate-900 text-xl shadow-sm hover:scale-105 transition-transform"
          >
            C
          </Link>
          <button
            type="button"
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
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight block truncate">
                  ConvoDeck
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block truncate">
                  {isAgent ? "Agent Workstation" : "WhatsApp CRM"}
                </span>
              </div>
            </Link>

            <button
              type="button"
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

      {/* Workspace Indicator */}
      <div
        className={
          isCollapsed ? "px-2 py-1 flex flex-col items-center" : "px-4 py-1"
        }
      >
        {isCollapsed ? (
          <>
            <Link
              href={isAgent ? "/agent/dashboard" : "/settings"}
              aria-label={`Workspace: ${workspaceName}`}
              title={`Workspace: ${workspaceName}`}
              className="w-12 h-12 neu-convex rounded-full flex items-center justify-center text-xs font-bold text-slate-900 hover:scale-105 transition-transform relative group"
            >
              <span>{workspaceName.substring(0, 2).toUpperCase()}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </Link>
            <div className="neu-dribbble-divider my-2 w-full" aria-hidden="true" />
          </>
        ) : (
          <>
            <Link
              href={isAgent ? "/agent/dashboard" : "/settings"}
              aria-label={`Workspace: ${workspaceName}. Click to open Settings.`}
              className="p-2.5 neu-convex rounded-2xl flex items-center justify-between text-xs sm:text-sm transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full bg-slate-900/10 text-slate-900 font-bold flex items-center justify-center text-xs shadow-inner"
                >
                  {workspaceName.substring(0, 1).toUpperCase()}
                </div>
                <span className="font-bold text-slate-900 truncate">
                  {workspaceName}
                </span>
              </div>
              <ShieldCheck
                className="w-4 h-4 text-slate-900 shrink-0 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
            </Link>
            <div className="neu-dribbble-divider-full my-2" aria-hidden="true" />
          </>
        )}
      </div>

      {/* Dynamic Nav Links with Group Dividers */}
      <DashboardClientNav
        userRole={userRole}
        isCollapsed={isCollapsed}
        onOpenAddLead={onOpenAddLead}
      />

      {/* WhatsApp Business Connected Line Card */}
      <div className={isCollapsed ? "p-2 flex flex-col items-center" : "p-3 sm:p-4"}>
        {isCollapsed ? (
          <>
            <div className="neu-dribbble-divider my-1.5 w-full" aria-hidden="true" />
            <Link
              href={isAgent ? "/agent/dashboard" : "/settings"}
              aria-label={`WhatsApp Live: ${whatsappNumber}`}
              title={`WhatsApp Live: ${whatsappNumber}`}
              className="w-12 h-12 neu-pressed rounded-full flex items-center justify-center border border-slate-300/40 text-slate-900 relative hover:scale-105 transition-transform"
            >
              <Phone className="w-5 h-5 text-slate-900" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
            </Link>
          </>
        ) : (
          <>
            <div className="neu-dribbble-divider-full my-2" aria-hidden="true" />
            <Link
              href={isAgent ? "/agent/dashboard" : "/settings"}
              className="block p-3 neu-pressed rounded-2xl space-y-1 transition-all border border-slate-300/40 group hover:border-slate-400/60"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    WhatsApp Business
                  </span>
                </div>
                <span className="text-[10px] bg-slate-900/10 text-slate-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-300/60">
                  <CheckCircle2 className="w-2.5 h-2.5 text-slate-900" />
                  Live
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-900 truncate">
                {whatsappNumber}
              </p>
              <p className="text-[10px] text-slate-500">Shared multi-agent line active.</p>
            </Link>
          </>
        )}
      </div>

      {/* Interactive Tour Guide Launcher */}
      <div className={isCollapsed ? "px-2 mb-1 flex justify-center" : "px-3 sm:px-4 mb-1"}>
        <TourLauncherButton isCollapsed={isCollapsed} />
      </div>

      {/* User Profile & Logout */}
      <div
        className={
          isCollapsed
            ? "p-2 flex flex-col items-center gap-2"
            : "p-3 sm:p-4 flex items-center justify-between"
        }
      >
        {isCollapsed ? (
          <>
            <div className="neu-dribbble-divider my-1 w-full" aria-hidden="true" />
            <div
              aria-label={`Signed in as ${userName}`}
              title={`Signed in as ${userName} (${userEmail})`}
              className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center font-bold text-xs text-slate-900 cursor-default"
            >
              {initials}
            </div>
            <form action={logoutUser}>
              <button
                type="submit"
                aria-label="Sign out of your account"
                title="Sign Out"
                className="w-10 h-10 neu-btn rounded-full flex items-center justify-center text-slate-900 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-900" aria-hidden="true" />
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center font-bold text-xs text-slate-900 shrink-0"
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
              </div>
            </div>

            <form action={logoutUser}>
              <button
                type="submit"
                aria-label="Sign out of your account"
                title="Sign Out"
                className="w-9 h-9 neu-btn rounded-full flex items-center justify-center text-slate-900 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4 text-slate-900" aria-hidden="true" />
              </button>
            </form>
          </>
        )}
      </div>
    </aside>
  );
}
