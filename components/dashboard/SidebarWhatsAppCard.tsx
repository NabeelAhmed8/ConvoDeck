"use client";

import React from "react";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

interface SidebarWhatsAppCardProps {
  whatsappNumber: string;
  isAgent: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * SidebarWhatsAppCard
 * Single-responsibility component for rendering the WhatsApp Business
 * connection status indicator in the desktop sidebar and mobile drawer.
 */
export function SidebarWhatsAppCard({
  whatsappNumber,
  isAgent,
  isCollapsed = false,
  onNavigate,
}: SidebarWhatsAppCardProps) {
  const targetHref = isAgent ? "/agent/dashboard" : "/settings";

  // Collapsed desktop sidebar icon rail
  if (isCollapsed) {
    return (
      <Link
        id="tour-btn-whatsapp-status"
        href={targetHref}
        onClick={onNavigate}
        aria-label={whatsappNumber ? `WhatsApp Live: ${whatsappNumber}` : "WhatsApp: Not Connected"}
        title={whatsappNumber ? `WhatsApp Live: ${whatsappNumber}` : "WhatsApp: Not Connected (Click to set up)"}
        className="w-11 h-11 neu-pressed rounded-full flex items-center justify-center border border-slate-300/40 text-slate-800 relative hover:scale-105 transition-transform"
      >
        <Phone className={`w-4 h-4 ${whatsappNumber ? "text-emerald-600" : "text-slate-500"}`} />
        <span
          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            whatsappNumber ? "bg-[#25D366] animate-pulse" : "bg-amber-400"
          }`}
          aria-hidden="true"
        />
      </Link>
    );
  }

  // Expanded sidebar & mobile drawer card
  return (
    <Link
      id="tour-btn-whatsapp-status"
      href={targetHref}
      onClick={onNavigate}
      className="neu-pressed p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-3 group transition-all border border-slate-300/40 hover:border-[#ff6422]/30 cursor-pointer w-full bg-[#e9eff6]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl neu-convex flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Phone className={`w-4 h-4 ${whatsappNumber ? "text-emerald-600" : "text-slate-500"}`} />
        </div>
        <div className="min-w-0 text-left">
          <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
            WhatsApp Business
          </span>
          <p className="text-[11px] leading-tight truncate mt-0.5">
            {whatsappNumber ? (
              <span className="font-mono font-semibold text-slate-700">+{whatsappNumber}</span>
            ) : (
              <span className="text-slate-400 font-medium">Not connected</span>
            )}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center">
        {whatsappNumber ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1 shadow-xs group-hover:bg-amber-100 transition-colors">
            Connect
            <ArrowRight className="w-2.5 h-2.5 text-amber-600" />
          </span>
        )}
      </div>
    </Link>
  );
}

