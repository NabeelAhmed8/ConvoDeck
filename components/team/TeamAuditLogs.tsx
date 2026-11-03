"use client";

import React from "react";
import { IAuditLog } from "@/types";

interface TeamAuditLogsProps {
  logs: IAuditLog[];
}

export function TeamAuditLogs({ logs }: TeamAuditLogsProps) {
  if (logs.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        No audit events recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto chat-scrollbar w-full max-w-full">
      <table className="w-full min-w-[700px] text-left text-xs text-slate-700">
        <thead className="bg-[#f8fafc] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-6 whitespace-nowrap">Timestamp</th>
            <th className="py-3 px-6 whitespace-nowrap">Actor (Agent)</th>
            <th className="py-3 px-6 whitespace-nowrap">Action Performed</th>
            <th className="py-3 px-6 whitespace-nowrap">Activity Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/80">
          {logs.map((log) => (
            <tr
              key={log._id}
              className="hover:bg-slate-200/40 transition-colors"
            >
              <td className="py-3.5 px-6 whitespace-nowrap text-slate-500">
                {new Date(log.createdAt || Date.now()).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </td>

              <td className="py-3.5 px-6 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.actorName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full neu-pressed text-slate-700 font-semibold uppercase">
                    {log.actorRole}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {log.actorEmail}
                </span>
              </td>

              <td className="py-3.5 px-6 whitespace-nowrap">
                <span
                  className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    log.action === "SENT_MESSAGE"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : log.action === "DEACTIVATED_AGENT" ||
                        log.action === "REVOKED_ACCESS"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : log.action === "UPDATED_LEAD_STAGE"
                      ? "bg-[#ff6422]/10 text-[#ea5414] border border-[#ff6422]/30"
                      : "bg-purple-100 text-purple-800 border border-purple-300"
                  }`}
                >
                  {log.action.replace(/_/g, " ")}
                </span>
              </td>

              <td className="py-3.5 px-6 text-slate-600 font-mono text-[11px] leading-relaxed">
                {log.details}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
