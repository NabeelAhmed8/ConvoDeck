"use client";

import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

interface MobileTopNavProps {
  userName: string;
  userEmail: string;
  workspaceName: string;
  whatsappNumber: string;
  initials: string;
  isAgent: boolean;
  onOpenDrawer: () => void;
}

export function MobileTopNav({
  userName,
  userEmail,
  workspaceName,
  whatsappNumber,
  initials,
  isAgent,
  onOpenDrawer,
}: MobileTopNavProps) {
  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-[56px] sm:h-[64px] px-2 sm:px-3 flex items-center justify-center w-full bg-[#f3f6fa]/95 backdrop-blur-md">
      <div className="w-full h-10 sm:h-11 neu-card rounded-xl px-3 sm:px-4 flex items-center justify-between border border-white/90 shadow-[6px_6px_18px_rgba(160,178,204,0.25),-6px_-6px_18px_#ffffff] bg-white/95">
        {/* Hamburger + Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Open navigation menu"
            className="w-10 h-10 sm:w-11 sm:h-11 neu-btn rounded-xl flex items-center justify-center text-slate-800 hover:text-[#ff6422] transition-colors cursor-pointer shrink-0"
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
              <span className="text-[9px] sm:text-[10px] text-[#ff6422] font-bold uppercase tracking-wider block truncate">
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
  );
}
