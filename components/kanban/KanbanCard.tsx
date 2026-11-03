"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, Phone, MoreVertical, Trash2, Building2, DollarSign } from "lucide-react";
import { ILead, LeadStage } from "@/types";
import { updateLeadStage, deleteLead } from "@/actions/leadActions";
import { useChatStore } from "@/store/useChatStore";
import { toast } from "@/store/useToastStore";

interface KanbanCardProps {
  lead: ILead;
  onRefresh?: () => void;
}

const STAGES: { value: LeadStage; label: string }[] = [
  { value: "NEW", label: "New Inquiry" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "DEMO_SCHEDULED", label: "Demo Scheduled" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "WON", label: "Closed Won" },
  { value: "LOST", label: "Lost" },
];

export function KanbanCard({ lead, onRefresh }: KanbanCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const setActiveLead = useChatStore((state) => state.setActiveLead);

  const handleStageChange = async (newStage: LeadStage) => {
    setIsUpdating(true);
    setShowMenu(false);
    await updateLeadStage(lead._id!, newStage);
    setIsUpdating(false);
    toast.success("Stage Updated", `${lead.name} moved to stage ${newStage.replace(/_/g, " ")}`);
    if (onRefresh) onRefresh();
  };

  const handleDelete = async () => {
    setShowMenu(false);
    await deleteLead(lead._id!);
    toast.success("Lead Deleted", `${lead.name} has been removed from the sales pipeline.`);
    if (onRefresh) onRefresh();
  };

  const handleOpenChat = () => {
    setActiveLead(lead);
  };

  return (
    <div
      className={`group relative neu-card neu-card-hover p-4 rounded-2xl transition-all duration-200 text-slate-800 bg-white ${
        isUpdating ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Top Header: Name & Menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm truncate hover:text-[#ea5414] transition-colors">
            {lead.name}
          </h4>
          {lead.company && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
              <Building2 className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />
              <span className="truncate">{lead.company}</span>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label={`Options menu for lead ${lead.name}`}
            aria-haspopup="menu"
            aria-expanded={showMenu}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-full neu-btn transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" aria-hidden="true" />
          </button>

          {showMenu && (
            <>
              <div
                aria-hidden="true"
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div
                role="menu"
                aria-label="Lead Actions"
                className="absolute right-0 mt-1 w-48 neu-card rounded-2xl shadow-xl py-1.5 z-30 text-xs text-slate-800 bg-white border border-slate-200/80 overflow-hidden"
              >
                <div className="px-3 py-1 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Move to Stage
                </div>
                {STAGES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    role="menuitem"
                    onClick={() => handleStageChange(s.value)}
                    disabled={s.value === lead.stage}
                    className={`w-full text-left px-3 py-1.5 hover:neu-flat hover:text-slate-900 flex items-center justify-between cursor-pointer transition-all ${
                      s.value === lead.stage ? "font-bold text-[#ea5414] neu-pressed-accent" : "text-slate-700"
                    }`}
                  >
                    {s.label}
                    {s.value === lead.stage && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
                <div className="border-t border-slate-200/80 my-1" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Delete Lead
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Phone & Value */}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-700">
        <div className="flex items-center gap-1 text-slate-500">
          <Phone className="w-3 h-3 text-emerald-600" aria-hidden="true" />
          <span aria-label={`Phone number: ${lead.phone}`}>+{lead.phone}</span>
        </div>
        {lead.dealValue > 0 && (
          <div className="flex items-center font-bold text-emerald-700 neu-pressed px-2.5 py-0.5 rounded-full text-[11px] font-mono">
            <DollarSign className="w-3 h-3 -mr-0.5" aria-hidden="true" />
            <span aria-label={`Deal value: $${lead.dealValue}`}>{lead.dealValue.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Last Message Snippet */}
      {lead.lastMessage && (
        <div className="mt-2.5 p-2 neu-pressed rounded-lg text-xs text-slate-700 line-clamp-2 border border-slate-300/30">
          <span className="font-semibold text-slate-900">Latest: </span>
          {lead.lastMessage}
        </div>
      )}

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {lead.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 neu-pressed text-[#ea5414] rounded-md text-[10px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Footer Action */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {new Date(lead.updatedAt || lead.createdAt || Date.now()).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}
        </span>

        <Link
          href={`/chat?leadId=${lead._id}`}
          onClick={handleOpenChat}
          aria-label={`Open WhatsApp conversation with ${lead.name}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ea5414] neu-btn px-3 py-1 rounded-full transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
          WhatsApp Chat
          {lead.unreadCount && lead.unreadCount > 0 ? (
            <span
              aria-label={`${lead.unreadCount} unread messages`}
              className="ml-1 px-1.5 py-0.2 bg-[#25D366] text-white font-black rounded-full text-[10px]"
            >
              {lead.unreadCount}
            </span>
          ) : null}
        </Link>
      </div>
    </div>
  );
}
