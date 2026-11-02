import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/authActions";
import { DashboardNavWrapper } from "@/components/dashboard/DashboardNavWrapper";
import { DashboardMainContent } from "@/components/dashboard/DashboardMainContent";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await getCurrentUser();

  // Strict session enforcement: If user is not logged in or has logged out, redirect to /login
  if (!authData || !authData.user) {
    redirect("/login");
  }

  const userName = authData.user.name || "Agent";
  const userEmail = authData.user.email || "";
  const workspaceName = authData.workspace?.name || "My Workspace";
  const whatsappNumber = authData.workspace?.whatsappPhoneNumber || "";
  const userRole = authData.user.role || "agent";

  return (
    <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] bg-[#f3f6fa] text-slate-900 flex flex-col lg:flex-row overflow-hidden selection:bg-blue-600/20 selection:text-slate-900 w-full max-w-full">
      {/* Soft Ambient Light Source for tactile Neumorphic shadows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/60 rounded-full blur-[140px]" />
      </div>

      {/* Responsive Navigation: Mobile/Tablet Hamburger Drawer + Desktop Collapsible Sidebar */}
      <DashboardNavWrapper
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        workspaceName={workspaceName}
        whatsappNumber={whatsappNumber}
      />

      {/* Main Content Area: Fixed padding-top on mobile (< lg) offsets the fixed header exactly */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 w-full max-w-full pt-[56px] sm:pt-[64px] lg:pt-0 overflow-hidden relative z-10">
        <DashboardMainContent>
          {children}
        </DashboardMainContent>
      </div>
    </div>
  );
}
