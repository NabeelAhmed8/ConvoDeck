"use client";

import React from "react";
import {
  BellOff,
  Bell,
  MoreVertical,
  CheckCheck,
  MessageSquareDot,
  UserCheck,
  Ban,
  Eraser,
  Trash2,
} from "lucide-react";
import { ILead } from "@/types";
import { StageBadge } from "@/components/ui/Badge";

interface ChatLeadItemProps {
  lead: ILead;
  isSelected: boolean;
  isMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onToggleMenu: () => void;
  onToggleUnread: () => void;
  onToggleMute: () => void;
  onToggleBlock: () => void;
  onRequestClear: () => void;
  onRequestDelete: () => void;
}

export function ChatLeadItem({
  lead,
  isSelected,
  isMenuOpen,
  menuRef,
  onSelect,
  onToggleMenu,
  onToggleUnread,
  onToggleMute,
  onToggleBlock,
  onRequestClear,
  onRequestDelete,
}: ChatLeadItemProps) {
  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Conversation with ${lead.name}, stage ${lead.stage}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all relative ${
        isSelected
          ? "neu-pressed-accent border-l-4 border-blue-600 bg-[#eff6ff]/40"
          : "hover:bg-slate-50/80"
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          aria-hidden="true"
          className="w-11 h-11 rounded-full neu-pressed text-slate-800 flex items-center justify-center font-bold text-xs bg-[#f1f5f9]"
        >
          {initials}
        </div>
        {lead.unreadCount && lead.unreadCount > 0 ? (
          <span
            aria-label={`${lead.unreadCount} unread`}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[#25D366] text-white rounded-full text-[10px] flex items-center justify-center font-black shadow-sm"
          >
            {lead.unreadCount}
          </span>
        ) : null}
      </div>

      {/* Lead Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-1">
          <h3
            className={`text-xs font-bold truncate ${
              isSelected ? "text-blue-600" : "text-slate-900"
            }`}
          >
            {lead.name}
          </h3>

          {/* Meta Info & 3-Dots Menu Trigger */}
          <div className="flex items-center gap-1 shrink-0">
            {lead.isMuted && (
              <BellOff className="w-3 h-3 text-slate-400" aria-label="Muted" />
            )}
            <span suppressHydrationWarning className="text-[10px] text-slate-500">
              {lead.lastMessageAt
                ? new Date(lead.lastMessageAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>

            {/* 3-Dots Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu();
              }}
              aria-label={`Options for ${lead.name}`}
              title="Chat options"
              className="p-1 -mr-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 truncate mb-1.5">
          {lead.lastMessage || "No messages yet"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <StageBadge stage={lead.stage} />
            {lead.isBlocked && (
              <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Ban className="w-2.5 h-2.5" /> Blocked
              </span>
            )}
          </div>
          {lead.dealValue > 0 && (
            <span className="text-[11px] font-bold text-emerald-600 font-mono">
              ${lead.dealValue}
            </span>
          )}
        </div>
      </div>

      {/* 3-Dot Options Context Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2 top-9 z-40 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 space-y-0.5 text-xs text-slate-800 animate-in fade-in zoom-in-95"
        >
          {/* Mark Unread / Read */}
          <button
            type="button"
            onClick={onToggleUnread}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-medium text-slate-700 transition-colors cursor-pointer text-left"
          >
            {lead.unreadCount ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Mark as read</span>
              </>
            ) : (
              <>
                <MessageSquareDot className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Mark as unread</span>
              </>
            )}
          </button>

          {/* Mute / Unmute */}
          <button
            type="button"
            onClick={onToggleMute}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-medium text-slate-700 transition-colors cursor-pointer text-left"
          >
            {lead.isMuted ? (
              <>
                <Bell className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Unmute notifications</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Mute notifications</span>
              </>
            )}
          </button>

          {/* Block / Unblock Contact */}
          <button
            type="button"
            onClick={onToggleBlock}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-medium text-slate-700 transition-colors cursor-pointer text-left"
          >
            {lead.isBlocked ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Unblock contact</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Block contact</span>
              </>
            )}
          </button>

          <div className="h-px bg-slate-200/80 my-1" />

          {/* Clear Messages */}
          <button
            type="button"
            onClick={onRequestClear}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-rose-50 flex items-center gap-2 font-medium text-rose-600 transition-colors cursor-pointer text-left"
          >
            <Eraser className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Clear all messages</span>
          </button>

          {/* Delete Entire Chat */}
          <button
            type="button"
            onClick={onRequestDelete}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-rose-50 flex items-center gap-2 font-medium text-rose-600 transition-colors cursor-pointer text-left"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Delete conversation</span>
          </button>
        </div>
      )}
    </div>
  );
}
