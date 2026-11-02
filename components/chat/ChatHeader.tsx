"use client";

import React from "react";
import { ArrowLeft, PanelRightClose, PanelRightOpen, X } from "lucide-react";
import { ILead, LeadStage } from "@/types";

interface ChatHeaderProps {
  activeLead: ILead;
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
  onClose: () => void;
  onStageChange: (stage: LeadStage) => void;
}

export function ChatHeader({
  activeLead,
  showDrawer,
  setShowDrawer,
  onClose,
  onStageChange,
}: ChatHeaderProps) {
  return (
    <div className="p-2 sm:p-2.5 bg-white border-b border-slate-200/70 flex items-center justify-between z-30 text-slate-900 rounded-none shadow-xs shrink-0 sticky top-0">
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to chats list"
          className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 neu-btn rounded-full cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div
          aria-hidden="true"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full neu-pressed text-slate-800 font-bold text-xs flex items-center justify-center shrink-0"
        >
          {activeLead.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
              {activeLead.name}
            </h3>
            <span className="hidden sm:inline-flex text-[10px] text-emerald-600 font-semibold items-center gap-0.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              WhatsApp
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 truncate">
            <span>+{activeLead.phone}</span>
            {activeLead.company && (
              <span className="text-slate-400 truncate">• {activeLead.company}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1">
        {/* Stage Dropdown */}
        <label htmlFor="lead-stage-dropdown" className="sr-only">
          Lead Stage
        </label>
        <select
          id="lead-stage-dropdown"
          name="leadStage"
          aria-label="Change lead stage"
          value={activeLead.stage}
          onChange={(e) => onStageChange(e.target.value as LeadStage)}
          className="text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-full neu-input text-slate-900 focus:outline-none max-w-[85px] xs:max-w-[110px] sm:max-w-none truncate"
        >
          <option value="NEW">New Inquiry</option>
          <option value="CONTACTED">Contacted</option>
          <option value="DEMO_SCHEDULED">Demo Scheduled</option>
          <option value="PROPOSAL_SENT">Proposal Sent</option>
          <option value="WON">Closed Won 🎉</option>
          <option value="LOST">Lost</option>
        </select>

        {/* Toggle CRM Details Drawer */}
        <button
          type="button"
          onClick={() => setShowDrawer(!showDrawer)}
          aria-label={showDrawer ? "Close customer details drawer" : "Open customer details drawer"}
          aria-expanded={showDrawer}
          className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 neu-btn rounded-full cursor-pointer shrink-0"
        >
          {showDrawer ? (
            <PanelRightClose className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          ) : (
            <PanelRightOpen className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          )}
        </button>

        {/* Close Conversation */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close conversation"
          title="Close conversation"
          className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 neu-btn rounded-full cursor-pointer shrink-0"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
