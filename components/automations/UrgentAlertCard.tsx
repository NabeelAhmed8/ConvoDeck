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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[4px_4px_16px_rgba(160,178,204,0.15)] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Urgent Priority & Sentiment Tagging
              {enabled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Flags angry, critical, or urgent customer messages with an <strong>#Urgent</strong> badge in your inbox.
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
          <div className="flex flex-wrap gap-1.5 mb-2">
            {urgentKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => onUpdateUrgentKeywords(urgentKeywords.filter((k) => k !== kw))}
                  className="hover:text-rose-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Add trigger keyword (e.g., complaint, broken)..."
              value={newKw}
              onChange={(e) => setNewKw(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
