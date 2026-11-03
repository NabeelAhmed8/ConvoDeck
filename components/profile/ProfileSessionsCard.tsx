"use client";

import React, { useState, useEffect } from "react";
import { Laptop, Smartphone, LogOut, ShieldCheck } from "lucide-react";
import { logoutUser } from "@/actions/authActions";

export function ProfileSessionsCard() {
  const [deviceInfo, setDeviceInfo] = useState("Web Browser Session");
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browser = "Web Browser";
      let os = "Desktop";
      let isMobile = false;

      if (ua.includes("Windows")) os = "Windows PC";
      else if (ua.includes("Macintosh")) os = "macOS";
      else if (ua.includes("Linux")) os = "Linux";
      else if (ua.includes("Android")) {
        os = "Android Device";
        isMobile = true;
      } else if (ua.includes("iPhone") || ua.includes("iPad")) {
        os = "iOS Device";
        isMobile = true;
      }

      if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Google Chrome";
      else if (ua.includes("Edg")) browser = "Microsoft Edge";
      else if (ua.includes("Firefox")) browser = "Mozilla Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Apple Safari";

      setDeviceInfo(`${browser} on ${os}`);
      setIsMobileDevice(isMobile);
    }
  }, []);

  const DeviceIcon = isMobileDevice ? Smartphone : Laptop;

  return (
    <div className="neu-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-3.5 sm:space-y-4 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-3 border-b border-slate-300/40 pb-3 min-w-0">
        <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/50 shrink-0">
          <Laptop className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-sm sm:text-base text-slate-900 truncate">
            Active Device &amp; Session
          </h2>
          <p className="text-xs text-slate-500 leading-tight">
            Current authenticated device connected to your ConvoDeck account.
          </p>
        </div>
      </div>

      {/* Main Active Session Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl neu-pressed bg-[#edf2f8] w-full min-w-0">
        {/* Device Information & Hierarchy */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Device Icon */}
          <div className="w-10 h-10 rounded-xl neu-convex flex items-center justify-center text-[#ff6422] shrink-0 bg-white/70 shadow-xs">
            <DeviceIcon className="w-5 h-5" />
          </div>

          {/* Clean 2-Row Vertical Alignment */}
          <div className="min-w-0 flex-1 space-y-1">
            {/* Row 1: Device Name & Active Now Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {deviceInfo}
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-200/70 inline-flex items-center gap-1 shadow-xs shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Now
              </span>
            </div>

            {/* Row 2: Security Shield Locked Inline With Text */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                Verified secure session • End-to-end encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Sign Out Action Button */}
        <form action={logoutUser} className="shrink-0 w-full sm:w-auto">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 neu-btn rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
