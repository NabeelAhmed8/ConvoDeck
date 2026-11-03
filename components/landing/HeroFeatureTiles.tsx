"use client";

import React from "react";
import { Zap, Users, Kanban, ShieldCheck } from "lucide-react";

export function HeroFeatureTiles() {
  const features = [
    {
      title: "Instant Sync",
      desc: "Live WhatsApp",
      icon: Zap,
    },
    {
      title: "Multi-Agent",
      desc: "Unified Inbox",
      icon: Users,
    },
    {
      title: "Sales Funnel",
      desc: "Visual Kanban",
      icon: Kanban,
    },
    {
      title: "Official API",
      desc: "99.9% Uptime",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
      {features.map((f) => {
        const Icon = f.icon;
        return (
          <div
            key={f.title}
            className="neu-icon-tile p-3.5 sm:p-4 text-left flex flex-col justify-between group cursor-default"
          >
            <div className="w-8 h-8 rounded-xl neu-convex flex items-center justify-center text-slate-800 mb-3 group-hover:scale-105 transition-transform">
              <Icon className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {f.title}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {f.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

