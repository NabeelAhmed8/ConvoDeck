"use client";

import React from "react";
import { Search, MessageCircle } from "lucide-react";
import { ILead } from "@/types";
import { useChatStore } from "@/store/useChatStore";
import { StageBadge } from "@/components/ui/Badge";
import { markChatAsRead } from "@/actions/chatActions";

interface ChatSidebarProps {
  initialLeads: ILead[];
}

export function ChatSidebar({ initialLeads }: ChatSidebarProps) {
  const {
    activeLead,
    setActiveLead,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    updateLeadInStore,
  } = useChatStore();

  const filteredLeads = initialLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filter === "unread") {
      return matchesSearch && (lead.unreadCount || 0) > 0;
    }
    return matchesSearch;
  });

  const handleSelectLead = async (lead: ILead) => {
    setActiveLead(lead);
    if (lead.unreadCount && lead.unreadCount > 0) {
      updateLeadInStore({ _id: lead._id!, unreadCount: 0 });
      await markChatAsRead(lead._id!);
    }
  };

  return (
    <div
      className={`w-full md:w-72 lg:w-80 flex-col h-full min-h-0 neu-sidebar shrink-0 text-slate-800 ${
        activeLead ? "hidden md:flex" : "flex"
      }`}
    >
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/70 bg-white">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl neu-pressed text-blue-600 flex items-center justify-center font-bold bg-[#f1f5f9] shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">WhatsApp Inbox</h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Shared Multi-Agent Team</p>
            </div>
          </div>
          <span
            aria-label={`${filteredLeads.length} chats available`}
            className="text-[11px] sm:text-xs neu-pressed text-slate-600 px-2 sm:px-2.5 py-0.5 rounded-full font-medium bg-[#f1f5f9] shrink-0"
          >
            {filteredLeads.length} chats
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <label htmlFor="chat-search-input" className="sr-only">
            Search chats by contact name or phone number
          </label>
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            id="chat-search-input"
            name="chatSearch"
            type="search"
            aria-label="Search chats by contact name or phone number"
            placeholder="Search leads or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs neu-input rounded-full text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div role="tablist" aria-label="Chat filters" className="neu-tab-container p-1 rounded-full flex items-center gap-1.5 text-xs">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            aria-controls="chat-list"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
              filter === "all"
                ? "neu-tab-active font-bold"
                : "neu-tab"
            }`}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "unread"}
            aria-controls="chat-list"
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1 cursor-pointer ${
              filter === "unread"
                ? "neu-tab-active font-bold"
                : "neu-tab"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Leads List */}
      <div
        id="chat-list"
        role="tabpanel"
        className="flex-1 min-h-0 overflow-y-scroll chat-scrollbar divide-y divide-slate-200/50 overscroll-contain"
      >
        {filteredLeads.map((lead) => {
          const isSelected = activeLead?._id === lead._id;
          const initials = lead.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <div
              key={lead._id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Conversation with ${lead.name}, stage ${lead.stage}`}
              onClick={() => handleSelectLead(lead)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectLead(lead);
                }
              }}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
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
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`text-xs font-bold truncate ${
                      isSelected ? "text-blue-600" : "text-slate-900"
                    }`}
                  >
                    {lead.name}
                  </h3>
                  <span suppressHydrationWarning className="text-[10px] text-slate-500 shrink-0">
                    {lead.lastMessageAt
                      ? new Date(lead.lastMessageAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                <p className="text-xs text-slate-500 truncate mb-1.5">
                  {lead.lastMessage || "No messages yet"}
                </p>

                <div className="flex items-center justify-between">
                  <StageBadge stage={lead.stage} />
                  {lead.dealValue > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 font-mono">
                      ${lead.dealValue}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredLeads.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No chats found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
