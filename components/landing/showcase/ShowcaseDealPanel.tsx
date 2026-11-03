"use client";

import React from "react";
import { ArrowRight, Check, User } from "lucide-react";
import { ShowcaseDeal, ShowcaseStage } from "./types";
import { STAGES } from "./showcaseData";

interface ShowcaseDealPanelProps {
  deal: ShowcaseDeal;
  currentStage: ShowcaseStage;
  onSelectStage: (stage: ShowcaseStage) => void;
  isAssigned: boolean;
  onToggleAssign: () => void;
}

export function ShowcaseDealPanel({
  deal,
  currentStage,
  onSelectStage,
  isAssigned,
  onToggleAssign,
}: ShowcaseDealPanelProps) {
  const formattedUsd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(deal.dealValueUsd);

  return (
    <div className="neu-convex p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Deal Overview & Dynamic USD Price */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
          {deal.dealTitle}
        </h4>
        <p className="text-[11px] text-slate-500 leading-none">
          {deal.dealSeats}
        </p>
        <p className="text-lg font-black text-slate-900 pt-1 tracking-tight font-mono">
          {formattedUsd}
        </p>
      </div>

      {/* Interactive Stage Selector & Agent Assignment */}
      <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-2.5">
        <div className="w-full sm:w-auto">
          <span className="block text-[10px] font-semibold text-slate-500 mb-1.5 sm:text-right">
            Deal Stage (Click to test)
          </span>
          <div className="flex items-center gap-1.5">
            {STAGES.map((stage) => {
              const isActive = currentStage === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => onSelectStage(stage)}
                  aria-pressed={isActive}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                    isActive ? "neu-pill-active" : "neu-pill-idle hover:text-slate-900"
                  }`}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Assign Agent Toggle */}
        <button
          type="button"
          onClick={onToggleAssign}
          className="w-full sm:w-auto px-3.5 py-1.5 neu-btn text-xs font-bold text-slate-800 rounded-full flex items-center justify-center gap-1.5 hover:text-slate-950 transition-all cursor-pointer"
        >
          {isAssigned ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assigned: {deal.assignedAgent}</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-[#ff6422]" />
              <span>Assign Agent</span>
              <ArrowRight className="w-3 h-3 text-[#ff6422]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

