"use client";

import React, { useState, useEffect } from "react";
import { Laptop, LogOut, CheckCircle } from "lucide-react";
import { logoutUser } from "@/actions/authActions";

export function ProfileSessionsCard() {
  const [deviceInfo, setDeviceInfo] = useState("Web Browser Session");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browser = "Web Browser";
      let os = "Desktop";

      if (ua.includes("Windows")) os = "Windows PC";
      else if (ua.includes("Macintosh")) os = "macOS";
      else if (ua.includes("Linux")) os = "Linux";
      else if (ua.includes("Android")) os = "Android Device";
      else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS Device";

      if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Google Chrome";
      else if (ua.includes("Edg")) browser = "Microsoft Edge";
      else if (ua.includes("Firefox")) browser = "Mozilla Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Apple Safari";

      setDeviceInfo(`${browser} on ${os}`);
    }
  }, []);

  return (
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-300/40 pb-3">
        <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/50">
          <Laptop className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900">
            Active Device &amp; Session
          </h2>
          <p className="text-xs text-slate-500">
            Current authenticated device connected to your ConvoDeck account.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl neu-pressed bg-[#edf2f8]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl neu-convex flex items-center justify-center text-slate-700 shrink-0">
            <Laptop className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-900 truncate">
                {deviceInfo}
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1 shadow-xs shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Now
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Current session verified with secure HTTP-only JWT.
            </p>
          </div>
        </div>

        <form action={logoutUser} className="self-end sm:self-auto shrink-0">
          <button
            type="submit"
            className="px-4 py-2 neu-btn rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}

