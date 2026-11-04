"use client";

import React from "react";
import { Sparkles, Bot, MessageSquare, Shuffle, Activity } from "lucide-react";

interface AutomationsHeaderProps {
  activeRulesCount: number;
  totalLogsCount: number;
  autoReplyEnabled: boolean;
  roundRobinEnabled: boolean;
}

export function AutomationsHeader({
  activeRulesCount,
  totalLogsCount,
  autoReplyEnabled,
  roundRobinEnabled,
}: AutomationsHeaderProps) {
  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ff6422]/10 text-[#ff6422]">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Smart Automation Suite
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#ff6422]" aria-hidden="true" />
            Smart Automations &amp; AI Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automate WhatsApp customer greetings, lead qualification, agent routing, and urgent priority alerts.
          </p>
        </div>
      </div>

      {/* 4 Neumorphic KPI Cards (Matching Dashboard & Team Pages) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="neu-card neu-card-hover p-4 sm:p-5 rounded-2xl bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Rules</span>
            <div className="p-2 sm:p-2.5 rounded-xl neu-pressed text-[#ff6422] bg-[#f1f5f9]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {activeRulesCount} <span className="text-xs text-slate-400 font-semibold">/ 4</span>
          </p>
          <span className="text-[11px] text-slate-500">Active workflows</span>
        </div>

        <div className="neu-card neu-card-hover p-4 sm:p-5 rounded-2xl bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Executions</span>
            <div className="p-2 sm:p-2.5 rounded-xl neu-pressed text-blue-600 bg-[#f1f5f9]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{totalLogsCount}</p>
          <span className="text-[11px] text-slate-500">Total automated events</span>
        </div>

        <div className="neu-card neu-card-hover p-4 sm:p-5 rounded-2xl bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Auto-Greeting</span>
            <div className="p-2 sm:p-2.5 rounded-xl neu-pressed text-emerald-600 bg-[#f1f5f9]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black text-slate-900 mt-2">
            {autoReplyEnabled ? (
              <span className="text-emerald-600">Enabled</span>
            ) : (
              <span className="text-slate-400">Disabled</span>
            )}
          </p>
          <span className="text-[11px] text-slate-500">WhatsApp instant reply</span>
        </div>

        <div className="neu-card neu-card-hover p-4 sm:p-5 rounded-2xl bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Lead Routing</span>
            <div className="p-2 sm:p-2.5 rounded-xl neu-pressed text-purple-600 bg-[#f1f5f9]">
              <Shuffle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black text-slate-900 mt-2">
            {roundRobinEnabled ? (
              <span className="text-purple-600">Round-Robin</span>
            ) : (
              <span className="text-slate-400">Manual</span>
            )}
          </p>
          <span className="text-[11px] text-slate-500">Agent auto-assignment</span>
        </div>
      </div>
    </div>
  );
}
