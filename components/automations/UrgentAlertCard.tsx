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
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-4 bg-white transition-all">
      <div className="flex items-start justify-between gap-3 border-b border-slate-300/40 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/50 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Urgent Priority &amp; Sentiment</span>
              {enabled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                  Off
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
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
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {urgentKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => onUpdateUrgentKeywords(urgentKeywords.filter((k) => k !== kw))}
                  className="w-4 h-4 rounded-full hover:bg-rose-200 text-rose-500 hover:text-rose-900 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Add trigger keyword (e.g. refund, complaint)..."
              value={newKw}
              onChange={(e) => setNewKw(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
