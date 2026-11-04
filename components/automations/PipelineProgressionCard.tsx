"use client";

import React, { useState } from "react";
import { Kanban, Tag, Plus, X } from "lucide-react";

interface PipelineProgressionCardProps {
  enabled: boolean;
  demoKeywords: string[];
  pricingKeywords: string[];
  onToggle: (enabled: boolean) => void;
  onUpdateDemoKeywords: (kws: string[]) => void;
  onUpdatePricingKeywords: (kws: string[]) => void;
}

export function PipelineProgressionCard({
  enabled,
  demoKeywords,
  pricingKeywords,
  onToggle,
  onUpdateDemoKeywords,
  onUpdatePricingKeywords,
}: PipelineProgressionCardProps) {
  const [newDemoKw, setNewDemoKw] = useState("");
  const [newPricingKw, setNewPricingKw] = useState("");

  const handleAddDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDemoKw.trim()) return;
    const clean = newDemoKw.trim().toLowerCase();
    if (!demoKeywords.includes(clean)) {
      onUpdateDemoKeywords([...demoKeywords, clean]);
    }
    setNewDemoKw("");
  };

  const handleAddPricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPricingKw.trim()) return;
    const clean = newPricingKw.trim().toLowerCase();
    if (!pricingKeywords.includes(clean)) {
      onUpdatePricingKeywords([...pricingKeywords, clean]);
    }
    setNewPricingKw("");
  };

  return (
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-4 bg-white transition-all">
      <div className="flex items-start justify-between gap-3 border-b border-slate-300/40 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/50 shrink-0">
            <Kanban className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Auto Pipeline Progression</span>
              {enabled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                  Off
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Advances leads to <strong>DEMO_SCHEDULED</strong> or <strong>CONTACTED</strong> on keyword intent.
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
        <div className="space-y-4 pt-1">
          {/* Demo Keywords */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5 text-blue-600">
              <Tag className="w-3.5 h-3.5" />
              <span>Moves Lead to Demo Scheduled</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2 max-h-28 overflow-y-auto">
              {demoKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => onUpdateDemoKeywords(demoKeywords.filter((k) => k !== kw))}
                    className="w-4 h-4 rounded-full hover:bg-blue-200 text-blue-500 hover:text-blue-900 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddDemo} className="flex gap-2">
              <input
                type="text"
                placeholder="Add keyword (e.g. zoom, demo)..."
                value={newDemoKw}
                onChange={(e) => setNewDemoKw(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          </div>

          {/* Pricing Keywords */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5 text-emerald-600">
              <Tag className="w-3.5 h-3.5" />
              <span>Moves Lead to Contacted</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2 max-h-28 overflow-y-auto">
              {pricingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => onUpdatePricingKeywords(pricingKeywords.filter((k) => k !== kw))}
                    className="w-4 h-4 rounded-full hover:bg-emerald-200 text-emerald-500 hover:text-emerald-900 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddPricing} className="flex gap-2">
              <input
                type="text"
                placeholder="Add keyword (e.g. price, quote)..."
                value={newPricingKw}
                onChange={(e) => setNewPricingKw(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
