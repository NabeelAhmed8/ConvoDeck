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
  userAvatar?: string;
  isAgent: boolean;
  onOpenDrawer: () => void;
}

export function MobileTopNav({
  userName,
  userEmail,
  workspaceName,
  whatsappNumber,
  initials,
  userAvatar,
  isAgent,
  onOpenDrawer,
}: MobileTopNavProps) {
  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-[56px] sm:h-[64px] px-2 sm:px-3 flex items-center justify-center w-full bg-[#ebf0f7]/95 backdrop-blur-md">
      <div className="w-full h-10 sm:h-11 neu-card rounded-xl px-2.5 sm:px-4 flex items-center justify-between border border-white/80 bg-[#edf1f7]/95">
        {/* Hamburger + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            id="tour-btn-collapse"
            onClick={onOpenDrawer}
            aria-label="Open navigation menu"
            className="w-8 h-8 sm:w-10 sm:h-10 neu-btn rounded-xl flex items-center justify-center text-slate-800 hover:text-[#ff6422] transition-colors cursor-pointer shrink-0"
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

          <Link
            href={isAgent ? "/agent/profile" : "/profile"}
            aria-label={`Signed in as ${userName} — View Profile`}
            title={`Signed in as ${userName} (${userEmail}) — View Profile`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full neu-convex flex items-center justify-center text-xs font-bold text-slate-900 shadow-xs cursor-pointer shrink-0 overflow-hidden border border-slate-300/40 hover:scale-105 transition-transform"
          >
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              initials
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
