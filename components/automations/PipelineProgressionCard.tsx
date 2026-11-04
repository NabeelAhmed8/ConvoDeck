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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[4px_4px_16px_rgba(160,178,204,0.15)] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Auto Pipeline Stage Progression
              {enabled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Detects buyer intent keywords and automatically advances leads to <strong>DEMO_SCHEDULED</strong> or <strong>CONTACTED</strong>.
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
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          {/* Demo Schedule Trigger */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5 text-blue-600">
                <Tag className="w-3.5 h-3.5" />
                Moves Lead to Demo Scheduled (Keywords)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {demoKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => onUpdateDemoKeywords(demoKeywords.filter((k) => k !== kw))}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddDemo} className="flex gap-2">
              <input
                type="text"
                placeholder="Add keyword (e.g., demo, zoom)..."
                value={newDemoKw}
                onChange={(e) => setNewDemoKw(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </form>
          </div>

          {/* Pricing Inquiry Trigger */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Tag className="w-3.5 h-3.5" />
                Moves Lead to Contacted (Keywords)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {pricingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => onUpdatePricingKeywords(pricingKeywords.filter((k) => k !== kw))}
                    className="hover:text-emerald-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddPricing} className="flex gap-2">
              <input
                type="text"
                placeholder="Add keyword (e.g., pricing, quote)..."
                value={newPricingKw}
                onChange={(e) => setNewPricingKw(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
