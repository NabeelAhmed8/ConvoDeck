"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Phone,
  MoreVertical,
  Trash2,
  Building2,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Clock,
  Tag,
} from "lucide-react";
import { ILead, LeadStage } from "@/types";
import { updateLeadStage, deleteLead } from "@/actions/leadActions";
import { useChatStore } from "@/store/useChatStore";
import { toast } from "@/store/useToastStore";

interface KanbanCardProps {
  lead: ILead;
  userRole?: string;
  onRefresh?: () => void;
  onStageChange?: (leadId: string, newStage: LeadStage) => void;
}

const ORDERED_STAGES: LeadStage[] = [
  "NEW",
  "CONTACTED",
  "DEMO_SCHEDULED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
];

const STAGE_LABELS: Record<LeadStage, string> = {
  NEW: "New Inquiry",
  CONTACTED: "Contacted",
  DEMO_SCHEDULED: "Demo Scheduled",
  PROPOSAL_SENT: "Proposal Sent",
  WON: "Closed Won",
  LOST: "Lost",
};

export function KanbanCard({ lead, userRole = "admin", onRefresh, onStageChange }: KanbanCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const setActiveLead = useChatStore((state) => state.setActiveLead);

  const currentIndex = ORDERED_STAGES.indexOf(lead.stage);
  const prevStage = currentIndex > 0 ? ORDERED_STAGES[currentIndex - 1] : null;
  const nextStage =
    currentIndex >= 0 && currentIndex < ORDERED_STAGES.length - 2
      ? ORDERED_STAGES[currentIndex + 1]
      : currentIndex === ORDERED_STAGES.length - 2
      ? ORDERED_STAGES[currentIndex + 1] // WON
      : null;

  const handleStageChange = async (newStage: LeadStage) => {
    setIsUpdating(true);
    setShowMenu(false);
    if (onStageChange) {
      onStageChange(lead._id!, newStage);
    }
    await updateLeadStage(lead._id!, newStage);
    setIsUpdating(false);
    toast.success("Stage Updated", `${lead.name} moved to ${STAGE_LABELS[newStage]}`);
    if (onRefresh) onRefresh();
  };

  const handleDelete = async () => {
    setShowMenu(false);
    await deleteLead(lead._id!);
    toast.success("Lead Deleted", `${lead.name} removed from pipeline.`);
    if (onRefresh) onRefresh();
  };

  const handleOpenChat = () => {
    setActiveLead(lead);
  };

  // Extract initials for modern avatar
  const initials = (lead.name || "Customer")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Relative formatted date
  const formattedDate = new Date(
    lead.updatedAt || lead.createdAt || Date.now()
  ).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`group relative bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-slate-800 ${
        isUpdating ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Top Header: Customer Avatar + Name & Options */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-[#ea5414] transition-colors leading-tight">
              {lead.name}
            </h4>
            {lead.company ? (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{lead.company}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 font-mono">
                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>+{lead.phone?.replace(/\D/g, "")}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3-Dot Options Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label={`Options menu for lead ${lead.name}`}
            aria-haspopup="menu"
            aria-expanded={showMenu}
            className="w-7 h-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" aria-hidden="true" />
          </button>

          {showMenu && (
            <>
              <div
                aria-hidden="true"
                className="fixed inset-0 z-30"
                onClick={() => setShowMenu(false)}
              />
              <div
                role="menu"
                aria-label="Lead Actions"
                className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl py-1.5 z-40 text-xs text-slate-800 border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
              >
                <div className="px-3 py-1 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Move to Stage
                </div>
                {ORDERED_STAGES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="menuitem"
                    onClick={() => handleStageChange(s)}
                    disabled={s === lead.stage}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-all ${
                      s === lead.stage ? "font-bold text-[#ea5414] bg-orange-50" : "text-slate-700"
                    }`}
                  >
                    <span>{STAGE_LABELS[s]}</span>
                    {s === lead.stage && <span className="text-[#ea5414] font-bold">✓</span>}
                  </button>
                ))}
                {userRole !== "agent" && (
                  <>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer transition-colors font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Delete Lead
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Middle Row: Deal Value & Phone if company is shown */}
      <div className="flex items-center justify-between mt-3 gap-2">
        {lead.dealValue > 0 ? (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200/80 font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 -mr-1" />
            <span>{lead.dealValue.toLocaleString()}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">No value assigned</span>
        )}

        {lead.company && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>+{lead.phone?.replace(/\D/g, "")}</span>
          </div>
        )}
      </div>

      {/* Last Message Snippet */}
      {lead.lastMessage && (
        <div className="mt-2.5 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200/60 line-clamp-2 leading-relaxed">
          <strong className="text-slate-800 font-semibold">Latest: </strong>
          <span>{lead.lastMessage}</span>
        </div>
      )}

      {/* Tags Chips */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {lead.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
            >
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      )}

      {/* Bottom Footer Actions: Quick Stage Shift & WhatsApp Button */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Quick Stage Step Buttons (For fast keyboard/touch movements) */}
        <div className="flex items-center gap-1">
          {prevStage && (
            <button
              type="button"
              onClick={() => handleStageChange(prevStage)}
              title={`Move back to ${STAGE_LABELS[prevStage]}`}
              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {nextStage && (
            <button
              type="button"
              onClick={() => handleStageChange(nextStage)}
              title={`Advance to ${STAGE_LABELS[nextStage]}`}
              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="text-[10px] text-slate-400 ml-1 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>{formattedDate}</span>
          </span>
        </div>

        {/* WhatsApp Chat Button */}
        <Link
          href={`/chat?leadId=${lead._id}`}
          onClick={handleOpenChat}
          aria-label={`Open WhatsApp conversation with ${lead.name}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Chat</span>
          {lead.unreadCount && lead.unreadCount > 0 ? (
            <span
              aria-label={`${lead.unreadCount} unread messages`}
              className="px-1.5 py-0.2 bg-[#25D366] text-white font-black rounded-full text-[9px] group-hover:bg-white group-hover:text-emerald-800"
            >
              {lead.unreadCount}
            </span>
          ) : null}
        </Link>
      </div>
    </div>
  );
}
