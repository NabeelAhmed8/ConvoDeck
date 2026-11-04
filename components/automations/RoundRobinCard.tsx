"use client";

import React from "react";
import { Users, Shuffle } from "lucide-react";

interface RoundRobinCardProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function RoundRobinCard({ enabled, onToggle }: RoundRobinCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[4px_4px_16px_rgba(160,178,204,0.15)] transition-all">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>Round-Robin Lead Assignment</span>
              {enabled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                  Active
                </span>
              )}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-0.5">
              Distributes incoming leads equally among active workspace agents.
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
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100/80">
          <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            Inbound WhatsApp prospects with no assigned agent will automatically rotate to the next active agent.
          </span>
        </div>
      )}
    </div>
  );
}
