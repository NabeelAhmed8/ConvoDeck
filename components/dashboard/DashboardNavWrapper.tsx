"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Phone,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { DashboardClientNav } from "@/components/dashboard/DashboardClientNav";
import { logoutUser } from "@/actions/authActions";
import { AddLeadModal } from "@/components/kanban/AddLeadModal";

interface DashboardNavWrapperProps {
  userName: string;
  userEmail: string;
  userRole: string;
  workspaceName: string;
  whatsappNumber: string;
}

export function DashboardNavWrapper({
  userName,
  userEmail,
  userRole,
  workspaceName,
  whatsappNumber,
}: DashboardNavWrapperProps) {
  const pathname = usePathname();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Restore desktop sidebar collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("convodeck_sidebar_collapsed");
      if (saved !== null) {
        setIsDesktopCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage access issues in private mode
    }
  }, []);

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("convodeck_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard navigation:
  // - Escape: close mobile drawer
  // - ArrowLeft / ArrowRight: collapse/expand desktop sidebar (when not inside inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMobileDrawerOpen) {
          setIsMobileDrawerOpen(false);
          return;
        }
      }

      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        setIsDesktopCollapsed((prev) => {
          if (!prev) {
            try {
              localStorage.setItem("convodeck_sidebar_collapsed", "true");
            } catch {}
            return true;
          }
          return prev;
        });
      } else if (e.key === "ArrowRight") {
        setIsDesktopCollapsed((prev) => {
          if (prev) {
            try {
              localStorage.setItem("convodeck_sidebar_collapsed", "false");
            } catch {}
            return false;
          }
          return prev;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileDrawerOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileDrawerOpen]);

  // Auto-close mobile drawer on route change or when screen resizes to desktop (>= 1024px)
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = () => {
    setIsMobileDrawerOpen(false);
  };

  const handleOpenAddLead = () => {
    setIsMobileDrawerOpen(false);
    setIsAddModalOpen(true);
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isAgent = userRole === "agent";

  return (
    <>
      {/* ============================================================== */}
      {/* 1. Mobile & Tablet Top Bar (Visible only on < lg screens)       */}
      {/* ============================================================== */}
      <header className="lg:hidden shrink-0 z-30 px-2.5 sm:px-4 pt-2 sm:pt-3 pb-1">
        <div className="neu-card rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between border border-white/90 shadow-[6px_6px_18px_rgba(160,178,204,0.25),-6px_-6px_18px_#ffffff] bg-white/90 backdrop-blur-md">
          {/* Hamburger + Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileDrawerOpen}
              className="w-10 h-10 sm:w-11 sm:h-11 neu-btn rounded-xl flex items-center justify-center text-slate-800 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" aria-hidden="true" />
            </button>

            <Link
              href={isAgent ? "/agent/dashboard" : "/dashboard"}
              className="flex items-center gap-2 sm:gap-2.5 group min-w-0"
              aria-label="ConvoDeck Dashboard Home"
            >
              <div
                aria-hidden="true"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl neu-convex flex items-center justify-center font-black text-slate-900 text-base sm:text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform"
              >
                C
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block leading-tight truncate">
                  ConvoDeck
                </span>
                <span className="text-[9px] sm:text-[10px] text-blue-600 font-bold uppercase tracking-wider block truncate">
                  {workspaceName}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Header Controls: WhatsApp Live Status + User Initials */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/chat"
              title={`WhatsApp Connected: ${whatsappNumber}`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full neu-pressed text-xs font-semibold text-slate-800 border border-slate-300/40 hover:text-emerald-600 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" aria-hidden="true" />
              <span className="text-[11px] font-bold hidden sm:inline">WhatsApp</span>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                Live
              </span>
            </Link>

            <div
              aria-label={`Signed in as ${userName}`}
              title={`Signed in as ${userName} (${userEmail})`}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full neu-convex flex items-center justify-center text-xs font-bold text-slate-900 shadow-xs cursor-default shrink-0"
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. Mobile & Tablet Backdrop Overlay                           */}
      {/* ============================================================== */}
      <div
        aria-hidden="true"
        onClick={() => setIsMobileDrawerOpen(false)}
        className={`lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity duration-300 ease-in-out ${
          isMobileDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ============================================================== */}
      {/* 3. Mobile & Tablet Slide-over Drawer (The Full Sidebar)       */}
      {/* ============================================================== */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Main Navigation Menu"
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] h-full neu-dribbble-rail bg-[#f0f3f8] text-slate-900 flex flex-col shadow-2xl transition-transform duration-300 ease-out transform ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer Header: Brand + Close button */}
        <div className="p-4 sm:p-5 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={isAgent ? "/agent/dashboard" : "/dashboard"}
              aria-label="ConvoDeck Dashboard Home"
              onClick={handleNavClick}
              className="flex items-center gap-3 min-w-0 group"
            >
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-full neu-convex flex items-center justify-center font-black text-slate-900 text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform"
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
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-label="Close navigation menu"
              className="w-8 h-8 sm:w-9 sm:h-9 neu-btn rounded-full flex items-center justify-center text-slate-900 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 text-slate-900" aria-hidden="true" />
            </button>
          </div>
          <div className="neu-dribbble-divider-full my-1" aria-hidden="true" />
        </div>

        {/* Workspace Indicator */}
        <div className="px-4 py-1 shrink-0">
          <Link
            href={isAgent ? "/agent/dashboard" : "/settings"}
            aria-label={`Workspace: ${workspaceName}. Click to open Settings.`}
            onClick={handleNavClick}
            className="p-2.5 neu-convex rounded-2xl flex items-center justify-between text-xs sm:text-sm transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                aria-hidden="true"
                className="w-7 h-7 rounded-full bg-slate-900/10 text-slate-900 font-bold flex items-center justify-center text-xs shadow-inner"
              >
                {workspaceName.substring(0, 1).toUpperCase()}
              </div>
              <span className="font-bold text-slate-900 truncate">{workspaceName}</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
          </Link>
          <div className="neu-dribbble-divider-full my-2" aria-hidden="true" />
        </div>

        {/* Navigation Links & Add Lead Button (Scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <DashboardClientNav
            userRole={userRole}
            isCollapsed={false}
            onNavigate={handleNavClick}
            onOpenAddLead={handleOpenAddLead}
          />
        </div>

        {/* WhatsApp Business Live Card */}
        <div className="p-3 sm:p-4 shrink-0">
          <div className="neu-dribbble-divider-full my-1.5" aria-hidden="true" />
          <Link
            href={isAgent ? "/agent/dashboard" : "/settings"}
            onClick={handleNavClick}
            className="block p-3 neu-pressed rounded-2xl space-y-1 transition-all border border-slate-300/40 group hover:border-slate-400/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-900">WhatsApp Business</span>
              </div>
              <span className="text-[10px] bg-slate-900/10 text-slate-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-300/60">
                <CheckCircle2 className="w-2.5 h-2.5 text-slate-900" />
                Live
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-slate-900 truncate">
              {whatsappNumber}
            </p>
            <p className="text-[10px] text-slate-500">
              Shared multi-agent line active.
            </p>
          </Link>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 sm:p-4 flex items-center justify-between shrink-0 border-t border-slate-200/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-full neu-pressed flex items-center justify-center font-bold text-xs text-slate-900 shrink-0"
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
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. Desktop Side Navigation Bar (Visible only on lg: screens)  */}
      {/* ============================================================== */}
      <aside
        aria-label="Main navigation sidebar"
        className={`hidden lg:flex flex-col neu-dribbble-rail text-slate-900 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isDesktopCollapsed
            ? "w-24 h-[calc(100vh-1.75rem)] my-3.5 ml-3.5 rounded-[36px] z-30"
            : "w-72 lg:w-80 h-[calc(100vh-1.75rem)] my-3.5 ml-3.5 rounded-[36px] shadow-[10px_10px_24px_rgba(166,180,200,0.45),-10px_-10px_24px_#ffffff] z-30"
        }`}
      >
        {/* Brand Header */}
        {isDesktopCollapsed ? (
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
              onClick={toggleDesktopSidebar}
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
                onClick={toggleDesktopSidebar}
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
        <div className={isDesktopCollapsed ? "px-2 py-1 flex flex-col items-center" : "px-4 py-1"}>
          {isDesktopCollapsed ? (
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
                  <span className="font-bold text-slate-900 truncate">{workspaceName}</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </Link>
              <div className="neu-dribbble-divider-full my-2" aria-hidden="true" />
            </>
          )}
        </div>

        {/* Dynamic Nav Links with Group Dividers */}
        <DashboardClientNav
          userRole={userRole}
          isCollapsed={isDesktopCollapsed}
          onOpenAddLead={handleOpenAddLead}
        />

        {/* WhatsApp Business Connected Line Card */}
        <div className={isDesktopCollapsed ? "p-2 flex flex-col items-center" : "p-3 sm:p-4"}>
          {isDesktopCollapsed ? (
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
                    <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" aria-hidden="true" />
                    <span className="text-xs font-bold text-slate-900">WhatsApp Business</span>
                  </div>
                  <span className="text-[10px] bg-slate-900/10 text-slate-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-300/60">
                    <CheckCircle2 className="w-2.5 h-2.5 text-slate-900" />
                    Live
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-900 truncate">
                  {whatsappNumber}
                </p>
                <p className="text-[10px] text-slate-500">
                  Shared multi-agent line active.
                </p>
              </Link>
            </>
          )}
        </div>

        {/* Real User Profile & Logout */}
        <div
          className={
            isDesktopCollapsed
              ? "p-2 flex flex-col items-center gap-2"
              : "p-3 sm:p-4 flex items-center justify-between"
          }
        >
          {isDesktopCollapsed ? (
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
                  className="w-9 h-9 neu-btn rounded-full flex items-center justify-center text-slate-900 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-900" aria-hidden="true" />
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  aria-hidden="true"
                  className="w-9 h-9 rounded-full neu-pressed flex items-center justify-center font-bold text-xs text-slate-900 shrink-0"
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
                  className="w-9 h-9 neu-btn rounded-full flex items-center justify-center text-slate-900 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-900" aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </div>
      </aside>

      {/* Global Add Lead Modal (Accessible from Mobile Drawer or Desktop Sidebar) */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadCreated={() => {
          window.location.reload();
        }}
      />
    </>
  );
}
