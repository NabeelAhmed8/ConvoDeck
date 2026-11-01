"use client";

import React, { useState, useEffect, useRef } from "react";
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

  // Dedicated Tactile Neumorphic Scrollbar for WhatsApp Inbox List
  const listRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);
  const [scrollInfo, setScrollInfo] = useState({
    hasScroll: false,
    top: 0,
    thumbHeight: 48,
  });

  const updateScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight > clientHeight + 4) {
      const trackHeight = clientHeight - 20;
      const rawThumbHeight = (clientHeight / scrollHeight) * trackHeight;
      const thumbHeight = Math.max(Math.min(rawThumbHeight, trackHeight - 12), 36);
      const maxScrollTop = scrollHeight - clientHeight;
      const maxThumbTravel = trackHeight - thumbHeight;
      const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTravel : 0;
      setScrollInfo({
        hasScroll: true,
        top: Math.max(0, Math.min(thumbTop, maxThumbTravel)),
        thumbHeight,
      });
    } else {
      setScrollInfo({ hasScroll: false, top: 0, thumbHeight: 40 });
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const el = listRef.current;
    if (!track || !el) return;
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const availableTrack = track.clientHeight - scrollInfo.thumbHeight;
    if (availableTrack <= 0) return;
    const targetTop = clickY - scrollInfo.thumbHeight / 2;
    const percentage = Math.max(0, Math.min(1, targetTop / availableTrack));
    el.scrollTop = percentage * (el.scrollHeight - el.clientHeight);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    if (listRef.current) {
      startScroll.current = listRef.current.scrollTop;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || !listRef.current || !trackRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    const track = trackRef.current;
    const el = listRef.current;
    const availableTrack = track.clientHeight - scrollInfo.thumbHeight;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (availableTrack > 0 && maxScroll > 0) {
      el.scrollTop = startScroll.current + (deltaY / availableTrack) * maxScroll;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    startY.current = e.clientY;
    if (listRef.current) {
      startScroll.current = listRef.current.scrollTop;
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !listRef.current || !trackRef.current) return;
      moveEvent.preventDefault();
      const deltaY = moveEvent.clientY - startY.current;
      const track = trackRef.current;
      const el = listRef.current;
      const availableTrack = track.clientHeight - scrollInfo.thumbHeight;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (availableTrack > 0 && maxScroll > 0) {
        el.scrollTop = startScroll.current + (deltaY / availableTrack) * maxScroll;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    updateScroll();
    const observer = new ResizeObserver(() => updateScroll());
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredLeads]);

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

      {/* Leads List with True Neumorphic Scrollbar Rail */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        <div
          ref={listRef}
          onScroll={updateScroll}
          id="chat-list"
          role="tabpanel"
          className="flex-1 min-h-0 overflow-y-scroll chat-messages-stream pr-3 divide-y divide-slate-200/50 overscroll-contain"
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

        {/* True Neumorphic Interactive Scrollbar Rail */}
        {scrollInfo.hasScroll && (
          <div className="absolute right-1 top-2.5 bottom-2.5 w-3 sm:w-3.5 z-20 flex flex-col justify-start items-center py-0.5 select-none">
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              title="Click or drag to scroll leads"
              className="w-2 sm:w-2.5 h-full rounded-full bg-[#ebf1f8] shadow-[inset_2px_2px_4px_#c9d6e7,inset_-2px_-2px_4px_#ffffff] border border-slate-300/50 relative cursor-pointer"
            >
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full rounded-full bg-gradient-to-b from-[#ffffff] via-[#f3f7fb] to-[#d8e3f0] shadow-[2px_3px_6px_rgba(160,178,204,0.55),-2px_-2px_5px_#ffffff] border border-white hover:shadow-[3px_4px_9px_rgba(150,170,200,0.65),-2px_-2px_6px_#ffffff] active:shadow-[inset_1px_1px_3px_#c2d1e4,inset_-1px_-1px_3px_#ffffff] cursor-grab active:cursor-grabbing transition-transform duration-75 ease-out touch-none flex items-center justify-center group"
                style={{
                  height: `${scrollInfo.thumbHeight}px`,
                  transform: `translateY(${scrollInfo.top}px)`,
                }}
              >
                <span className="w-0.5 sm:w-1 h-3.5 rounded-full bg-slate-400/50 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.15)] group-hover:bg-blue-600/70 group-active:bg-blue-600 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
