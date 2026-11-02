"use client";

import React, { useState, useEffect } from "react";
import { AddLeadModal } from "@/components/kanban/AddLeadModal";
import { MobileTopNav } from "@/components/dashboard/MobileTopNav";
import { MobileDrawer } from "@/components/dashboard/MobileDrawer";
import { DesktopSidebar } from "@/components/dashboard/DesktopSidebar";

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
      // Ignore in private browsing mode
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

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
        return;
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
        setIsDesktopCollapsed(true);
        try {
          localStorage.setItem("convodeck_sidebar_collapsed", "true");
        } catch {}
      } else if (e.key === "ArrowRight") {
        setIsDesktopCollapsed(false);
        try {
          localStorage.setItem("convodeck_sidebar_collapsed", "false");
        } catch {}
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileDrawerOpen]);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isAgent = userRole === "agent";

  return (
    <>
      {/* 1. Mobile & Tablet Top Bar */}
      <MobileTopNav
        userName={userName}
        userEmail={userEmail}
        workspaceName={workspaceName}
        whatsappNumber={whatsappNumber}
        initials={initials}
        isAgent={isAgent}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
      />

      {/* 2. Mobile & Tablet Slide-over Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        workspaceName={workspaceName}
        whatsappNumber={whatsappNumber}
        initials={initials}
        isAgent={isAgent}
        onOpenAddLead={() => setIsAddModalOpen(true)}
      />

      {/* 3. Desktop Side Navigation Bar */}
      <DesktopSidebar
        isCollapsed={isDesktopCollapsed}
        onToggleCollapse={toggleDesktopSidebar}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        workspaceName={workspaceName}
        whatsappNumber={whatsappNumber}
        initials={initials}
        isAgent={isAgent}
        onOpenAddLead={() => setIsAddModalOpen(true)}
      />

      {/* Quick Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
