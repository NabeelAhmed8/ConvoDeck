import React from "react";
import { getCurrentUser } from "@/actions/authActions";
import { DashboardNavWrapper } from "@/components/dashboard/DashboardNavWrapper";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await getCurrentUser();
  const userName = authData?.user?.name || "Sales Agent";
  const userEmail = authData?.user?.email || "agent@convodeck.com";
  const workspaceName = authData?.workspace?.name || "My Workspace";
  const whatsappNumber = authData?.workspace?.whatsappPhoneNumber || "+92 300 1234567";
  const userRole = authData?.user?.role || "admin";

  return (
    <div className="h-screen max-h-screen h-[100dvh] max-h-[100dvh] bg-[#f3f6fa] text-slate-900 flex flex-col lg:flex-row relative overflow-hidden selection:bg-blue-600/20 selection:text-slate-900 w-full max-w-full">
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
      <div className="flex-1 flex flex-col min-w-0 min-h-0 w-full max-w-full h-full pt-[64px] sm:pt-[72px] lg:pt-0 overflow-hidden relative z-10">
        <main
          aria-label="Main Content"
          className="flex-1 p-2 sm:p-3 lg:p-5 w-full max-w-full flex flex-col overflow-y-auto min-w-0 min-h-0 overscroll-contain"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
