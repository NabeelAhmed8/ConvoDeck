"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface DashboardMainContentProps {
  children: React.ReactNode;
}

export function DashboardMainContent({ children }: DashboardMainContentProps) {
  const pathname = usePathname();
  const isChat = pathname === "/chat" || pathname?.startsWith("/chat/");

  return (
    <main
      aria-label="Main Content"
      className={
        isChat
          ? "flex-1 w-full max-w-full flex flex-col overflow-hidden min-w-0 min-h-0 p-1 sm:p-2 lg:p-4 pb-1 sm:pb-2"
          : "flex-1 p-2 sm:p-3 lg:p-5 w-full max-w-full flex flex-col overflow-y-auto min-w-0 min-h-0 overscroll-contain"
      }
    >
      {children}
    </main>
  );
}
