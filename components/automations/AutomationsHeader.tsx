"use client";

import React from "react";
import { Sparkles, Bot, ShieldCheck } from "lucide-react";

interface AutomationsHeaderProps {
  activeRulesCount: number;
  totalLogsCount: number;
}

export function AutomationsHeader({
  activeRulesCount,
  totalLogsCount,
}: AutomationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ff6422]/10 text-[#ff6422]">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Smart CRM Engine
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-3 h-3" />
            Meta API v21.0 Ready
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-[#ff6422]" aria-hidden="true" />
          Smart Automations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Automate WhatsApp greetings, lead qualification, agent routing, and urgent priority alerts.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <div className="text-xs text-slate-500 font-medium">Active Rules</div>
          <div className="text-sm font-bold text-[#ff6422]">{activeRulesCount} / 4</div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <div className="text-xs text-slate-500 font-medium">Executions</div>
          <div className="text-sm font-bold text-slate-800">{totalLogsCount}</div>
        </div>
      </div>
    </div>
  );
}
