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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#ff6422]/10 text-[#ff6422]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Smart CRM Engine
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            Meta API v21.0
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-[#ff6422] shrink-0" aria-hidden="true" />
          <span>Smart Automations</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Automate WhatsApp greetings, lead qualification, agent routing, and urgent priority alerts.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0">
        <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Active Rules</div>
          <div className="text-sm sm:text-base font-bold text-[#ff6422]">{activeRulesCount} / 4</div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Executions</div>
          <div className="text-sm sm:text-base font-bold text-slate-800">{totalLogsCount}</div>
        </div>
      </div>
    </div>
  );
}
