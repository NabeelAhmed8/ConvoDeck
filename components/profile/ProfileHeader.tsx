"use client";

import React from "react";
import { User, ShieldCheck } from "lucide-react";

interface ProfileHeaderProps {
  role: string;
  workspaceName: string;
}

export function ProfileHeader({ role, workspaceName }: ProfileHeaderProps) {
  const isOwner = role === "admin";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl neu-convex flex items-center justify-center text-[#ff6422] shrink-0">
            <User className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Personal Profile &amp; Security
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal identity, login security, and CRM preferences.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-xs ${
            isOwner
              ? "bg-amber-50 text-amber-800 border-amber-200/80"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          {isOwner ? "Workspace Owner" : "Agent Seat"}
        </span>

        {workspaceName && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/70 border border-slate-200/70 text-slate-600 truncate max-w-[180px]">
            {workspaceName}
          </span>
        )}
      </div>
    </div>
  );
}
