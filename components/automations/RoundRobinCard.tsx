"use client";

import React from "react";
import { Users, Shuffle } from "lucide-react";

interface RoundRobinCardProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function RoundRobinCard({ enabled, onToggle }: RoundRobinCardProps) {
  return (
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-4 bg-white transition-all">
      <div className="flex items-start justify-between gap-3 border-b border-slate-300/40 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/50 shrink-0">
            <Shuffle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Round-Robin Lead Assignment</span>
              {enabled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                  Off
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
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
        <div className="text-xs text-slate-600 flex items-start gap-2.5 neu-pressed p-3.5 rounded-2xl">
          <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            Inbound WhatsApp prospects with no assigned agent will automatically rotate to the next active agent.
          </span>
        </div>
      )}
    </div>
  );
}
