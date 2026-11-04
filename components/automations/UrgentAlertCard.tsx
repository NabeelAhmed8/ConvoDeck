"use client";

import React, { useState } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";

interface UrgentAlertCardProps {
  enabled: boolean;
  urgentKeywords: string[];
  onToggle: (enabled: boolean) => void;
  onUpdateUrgentKeywords: (kws: string[]) => void;
}

export function UrgentAlertCard({
  enabled,
  urgentKeywords,
  onToggle,
  onUpdateUrgentKeywords,
}: UrgentAlertCardProps) {
  const [newKw, setNewKw] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKw.trim()) return;
    const clean = newKw.trim().toLowerCase();
    if (!urgentKeywords.includes(clean)) {
      onUpdateUrgentKeywords([...urgentKeywords, clean]);
    }
    setNewKw("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[4px_4px_16px_rgba(160,178,204,0.15)] transition-all">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>Urgent Priority & Sentiment</span>
              {enabled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  Active
                </span>
              )}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-0.5">
              Flags critical or angry messages with an <strong>#Urgent</strong> tag in the chat inbox.
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
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-32 overflow-y-auto">
            {urgentKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => onUpdateUrgentKeywords(urgentKeywords.filter((k) => k !== kw))}
                  className="w-4 h-4 rounded-full hover:bg-rose-200/70 text-rose-500 hover:text-rose-900 flex items-center justify-center transition-colors"
                  aria-label={`Remove keyword ${kw}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Add trigger keyword (e.g., complaint, refund)..."
              value={newKw}
              onChange={(e) => setNewKw(e.target.value)}
              className="flex-1 min-w-0 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 flex items-center gap-1 shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
