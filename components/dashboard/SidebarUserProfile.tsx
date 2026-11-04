"use client";

import React from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/actions/authActions";

interface SidebarUserProfileProps {
  userName: string;
  userEmail: string;
  initials: string;
  userAvatar?: string;
  isAgent?: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * SidebarUserProfile
 * Single-responsibility component for rendering the user's avatar, identity,
 * clickable link to /profile (or /agent/profile), and logout action button.
 */
export function SidebarUserProfile({
  userName,
  userEmail,
  initials,
  userAvatar = "",
  isAgent = false,
  isCollapsed = false,
  onNavigate,
}: SidebarUserProfileProps) {
  const profileHref = isAgent ? "/agent/profile" : "/profile";

  // Collapsed desktop sidebar rail view
  if (isCollapsed) {
    return (
      <div className="p-2 flex flex-col items-center gap-2">
        <div className="neu-dribbble-divider my-1 w-full" aria-hidden="true" />
        <Link
          href={profileHref}
          onClick={onNavigate}
          aria-label={`View Profile: ${userName}`}
          title={`Signed in as ${userName} (${userEmail}) — View ${isAgent ? "Agent " : ""}Profile`}
          className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center font-bold text-xs text-slate-900 hover:scale-105 transition-transform overflow-hidden border border-slate-300/40"
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
        <form action={logoutUser}>
          {isAgent && <input type="hidden" name="portal" value="agent" />}
          <button
            type="submit"
            id="tour-btn-logout"
            aria-label="Sign out of your account"
            title="Sign Out"
            className="w-10 h-10 neu-btn rounded-full flex items-center justify-center text-slate-900 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-900" aria-hidden="true" />
          </button>
        </form>
      </div>
    );
  }

  // Expanded desktop sidebar & mobile drawer view
  return (
    <div className="p-3 sm:p-4 flex items-center justify-between shrink-0">
      <Link
        href={profileHref}
        onClick={onNavigate}
        aria-label={`View Profile: ${userName}`}
        title={`View ${isAgent ? "Agent Workstation " : ""}Profile & Account Settings`}
        className="flex items-center gap-2.5 sm:gap-3 min-w-0 group hover:opacity-90 transition-opacity flex-1 pr-2 cursor-pointer"
      >
        <div
          aria-hidden="true"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full neu-pressed flex items-center justify-center font-bold text-xs text-slate-900 shrink-0 group-hover:scale-105 transition-transform border border-slate-300/40 overflow-hidden"
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
        </div>
        <div className="min-w-0 text-left">
          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#ea5414] transition-colors">
            {userName}
          </p>
          <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
        </div>
      </Link>

      <form action={logoutUser}>
        {isAgent && <input type="hidden" name="portal" value="agent" />}
        <button
          type="submit"
          id="tour-btn-logout"
          aria-label="Sign out of your account"
          title="Sign Out"
          className="w-9 h-9 neu-btn rounded-full flex items-center justify-center text-slate-900 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4 text-slate-900" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
