"use client";

import React from "react";
import { Search, MessageSquareDot } from "lucide-react";

interface ChatSidebarHeaderProps {
  chatCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: "all" | "unread";
  setFilter: (filter: "all" | "unread") => void;
}

export function ChatSidebarHeader({
  chatCount,
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
}: ChatSidebarHeaderProps) {
  return (
    <div className="p-3 sm:p-4 border-b border-slate-200/70 bg-white shadow-xs shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full neu-convex flex items-center justify-center text-[#ff6422] bg-white">
            <MessageSquareDot className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm">WhatsApp Inbox</h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
              Shared Multi-Agent Team
            </p>
          </div>
        </div>
        <span
          aria-label={`${chatCount} chats available`}
          className="text-[11px] sm:text-xs neu-pressed text-slate-600 px-2 sm:px-2.5 py-0.5 rounded-full font-medium bg-[#f1f5f9] shrink-0"
        >
          {chatCount} chats
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <label htmlFor="chat-search-input" className="sr-only">
          Search chats by contact name or phone number
        </label>
        <Search
          className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
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
      <div
        role="tablist"
        aria-label="Chat filters"
        className="neu-tab-container p-1 rounded-full flex items-center gap-1.5 text-xs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          aria-controls="chat-list"
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
            filter === "all" ? "neu-tab-active font-bold" : "neu-tab"
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
            filter === "unread" ? "neu-tab-active font-bold" : "neu-tab"
          }`}
        >
          Unread
        </button>
      </div>
    </div>
  );
}
