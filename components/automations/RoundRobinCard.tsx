"use client";

import React from "react";
import { Users, Shuffle } from "lucide-react";

interface RoundRobinCardProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function RoundRobinCard({ enabled, onToggle }: RoundRobinCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[4px_4px_16px_rgba(160,178,204,0.15)] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shuffle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Round-Robin Lead Assignment
              {enabled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                  Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Equally distributes incoming customer inquiries among all active team members and agents.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enabled ? "bg-[#ff6422]" : "bg-slate-300"
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
          <Users className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            New inbound WhatsApp leads with no assigned agent will automatically rotate to the next active agent.
          </span>
        </div>
      )}
    </div>
  );
}
