"use client";

import React from "react";
import { CheckCheck, Sparkles, UserCheck } from "lucide-react";
import { ShowcaseDeal } from "./types";

interface ShowcaseChatStreamProps {
  deal: ShowcaseDeal;
  showReply: boolean;
  onToggleReply: () => void;
}

export function ShowcaseChatStream({
  deal,
  showReply,
  onToggleReply,
}: ShowcaseChatStreamProps) {
  return (
    <div className="my-5 p-4 neu-pressed rounded-2xl relative space-y-3 bg-[#e9eff6]">
      {/* Customer Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
            {deal.avatarLetter}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-none truncate">
              {deal.leadName} • <span className="font-normal text-slate-600">{deal.company}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none font-mono">
              {deal.phone} • WhatsApp Verified
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleReply}
          className="text-[10px] font-bold text-[#ea5414] hover:text-[#ff6422] neu-btn px-2.5 py-1 rounded-full flex items-center gap-1 transition-all shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-[#ff6422]" />
          <span>{showReply ? "Hide Reply" : "Simulate Reply"}</span>
        </button>
      </div>

      {/* Customer Incoming Message */}
      <div className="p-3 bg-white/90 rounded-2xl text-xs text-slate-800 shadow-xs border border-white space-y-1">
        <p className="leading-relaxed">{deal.incomingMessage}</p>
        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
          <span>{deal.incomingTime}</span>
          <span>• Read</span>
          <CheckCheck className="w-3.5 h-3.5 text-[#ff6422]" aria-label="Read receipts" />
        </div>
      </div>

      {/* Dynamic Simulated Agent Reply */}
      {showReply && (
        <div className="p-3 bg-[#fff7ed] rounded-2xl text-xs text-slate-900 border-l-4 border-l-[#ff6422] shadow-xs space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#ea5414]">
            <UserCheck className="w-3 h-3" />
            <span>{deal.assignedAgent} (Sales Agent)</span>
          </div>
          <p className="leading-relaxed">{deal.agentReply}</p>
          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
            <span>Just now</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#ff6422]" />
          </div>
        </div>
      )}
    </div>
  );
}

