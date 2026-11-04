"use client";

import React from "react";
import { History, Activity, Bot, ArrowRight, Clock } from "lucide-react";
import { IAutomationLogItem } from "@/types/automation";

interface AutomationLogsListProps {
  logs: IAutomationLogItem[];
}

export function AutomationLogsList({ logs }: AutomationLogsListProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center mx-auto mb-3">
          <History className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Automation Executions Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          When customer messages arrive via WhatsApp or rules are triggered, automated actions will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#ff6422]" />
          Live Automation Audit Log
        </h3>
        <span className="text-xs text-slate-500">{logs.length} events</span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
        {logs.map((log) => {
          const badgeColor =
            log.ruleType === "AUTO_REPLY"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : log.ruleType === "PIPELINE_MOVE"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : log.ruleType === "URGENT_TAG"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : log.ruleType === "ROUND_ROBIN"
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : "bg-amber-50 text-amber-700 border-amber-200";

          return (
            <div key={log._id || `${log.ruleType}-${log.createdAt}`} className="p-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                    {log.ruleType}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{log.leadName}</span>
                  <span className="text-[11px] text-slate-600">({log.leadPhone})</span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : "Just now"}
                </div>
              </div>

              <div className="text-xs text-slate-700 mb-1 flex items-start gap-1.5">
                <span className="text-slate-600 font-semibold shrink-0">Trigger:</span>
                <span className="italic text-slate-800 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  "{log.triggerText}"
                </span>
              </div>

              <div className="text-xs text-slate-800 flex items-center gap-1 font-semibold">
                <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{log.actionTaken}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
