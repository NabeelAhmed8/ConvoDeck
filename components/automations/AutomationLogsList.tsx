"use client";

import React, { useState } from "react";
import { History, Activity, ArrowRight, Clock, RefreshCw, Search } from "lucide-react";
import { IAutomationLogItem } from "@/types/automation";
import { getAutomationLogs } from "@/actions/automationActions";

interface AutomationLogsListProps {
  logs: IAutomationLogItem[];
}

export function AutomationLogsList({ logs: initialLogs }: AutomationLogsListProps) {
  const [logs, setLogs] = useState<IAutomationLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const updated = await getAutomationLogs(50);
    setLogs(updated);
    setIsRefreshing(false);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = activeFilter === "ALL" || log.ruleType === activeFilter;
    if (!matchesFilter) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (log.leadName || "").toLowerCase().includes(q) ||
      (log.leadPhone || "").toLowerCase().includes(q) ||
      (log.triggerText || "").toLowerCase().includes(q) ||
      (log.actionTaken || "").toLowerCase().includes(q)
    );
  });

  const filterOptions: { label: string; value: string }[] = [
    { label: "All Events", value: "ALL" },
    { label: "Auto-Reply", value: "AUTO_REPLY" },
    { label: "Pipeline Move", value: "PIPELINE_MOVE" },
    { label: "Round-Robin", value: "ROUND_ROBIN" },
    { label: "Urgent Tag", value: "URGENT_TAG" },
    { label: "Handoff", value: "HANDOFF" },
  ];

  return (
    <div className="neu-card rounded-3xl overflow-hidden text-slate-900 bg-white transition-all">
      {/* Top Search & Filter Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#ff6422]" />
          <h3 className="font-bold text-sm text-slate-900">
            Live Automation Audit Trail
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
            {filteredLogs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              name="automationLogSearch"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, trigger..."
              className="w-full pl-9 pr-3.5 py-2 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl neu-btn text-slate-600 hover:text-slate-900 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#ff6422]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-50/70 border-b border-slate-200/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setActiveFilter(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
              activeFilter === opt.value
                ? "bg-[#ff6422] text-white shadow-xs font-bold"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      {filteredLogs.length === 0 ? (
        <div className="p-8 sm:p-14 text-center">
          <div className="w-12 h-12 rounded-2xl neu-pressed text-[#ff6422] flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            {search ? "No matching events found" : "No Automation Executions Yet"}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {search
              ? "Try adjusting your search terms or selecting 'All Events'."
              : "When customer messages arrive via WhatsApp or rules are triggered, automated actions will appear here in real-time."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {filteredLogs.map((log) => {
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
              <div
                key={log._id || `${log.ruleType}-${log.createdAt}`}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                      {log.ruleType}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{log.leadName}</span>
                    <span className="text-[11px] text-slate-600">({log.leadPhone})</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </div>
                </div>

                <div className="text-xs text-slate-700 mb-1.5 flex items-start gap-1.5">
                  <span className="text-slate-600 font-semibold shrink-0">Trigger:</span>
                  <span className="italic text-slate-800 font-medium bg-slate-100 px-2.5 py-0.5 rounded-lg text-[11px] break-words">
                    "{log.triggerText}"
                  </span>
                </div>

                <div className="text-xs text-slate-800 flex items-center gap-1.5 font-semibold">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="break-words">{log.actionTaken}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
