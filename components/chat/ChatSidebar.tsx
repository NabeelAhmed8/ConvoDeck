"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  MessageCircle,
  MoreVertical,
  Trash2,
  BellOff,
  Bell,
  Ban,
  UserCheck,
  CheckCheck,
  MessageSquareDot,
  Eraser,
  AlertTriangle,
} from "lucide-react";
import { ILead } from "@/types";
import { useChatStore } from "@/store/useChatStore";
import { StageBadge } from "@/components/ui/Badge";
import {
  markChatAsRead,
  markChatAsUnread,
  toggleMuteChat,
  toggleBlockContact,
  clearChatMessages,
  deleteChat,
} from "@/actions/chatActions";
import { getChatBroadcastChannel } from "@/lib/syncUtils";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/store/useToastStore";

interface ChatSidebarProps {
  initialLeads: ILead[];
}

export function ChatSidebar({ initialLeads }: ChatSidebarProps) {
  const {
    activeLead,
    setActiveLead,
    leads,
    setLeads,
    mergeUpdatedLeads,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    updateLeadInStore,
    removeLeadFromStore,
    setMessages,
  } = useChatStore();

  const [activeMenuLeadId, setActiveMenuLeadId] = useState<string | null>(null);
  const [targetLead, setTargetLead] = useState<ILead | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const lastSyncRef = useRef<string>(new Date().toISOString());

  // Close 3-dot dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuLeadId(null);
      }
    };
    if (activeMenuLeadId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuLeadId]);

  // Initialize leads from server-rendered props
  useEffect(() => {
    if (leads.length === 0 && initialLeads && initialLeads.length > 0) {
      setLeads(initialLeads);
    }
  }, [initialLeads, leads.length, setLeads]);

  // Listen to cross-tab BroadcastChannel for 0ms tab sync
  useEffect(() => {
    const channel = getChatBroadcastChannel();
    if (!channel) return;

    const handleBroadcast = (e: MessageEvent) => {
      const data = e.data;
      if (data?.type === "MESSAGE_SENT" && data.leadId) {
        updateLeadInStore({
          _id: data.leadId,
          lastMessage: data.message?.text || "",
          lastMessageAt: data.message?.createdAt || new Date(),
        });
      } else if (data?.type === "LEADS_SYNC" && data.leads) {
        mergeUpdatedLeads(data.leads);
      }
    };

    channel.addEventListener("message", handleBroadcast);
    return () => {
      channel.removeEventListener("message", handleBroadcast);
      channel.close();
    };
  }, [updateLeadInStore, mergeUpdatedLeads]);

  // Periodic workspace leads sync to detect inbound WhatsApp messages and status changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const syncLeads = async () => {
      if (document.hidden) {
        timeoutId = setTimeout(syncLeads, 4000);
        return;
      }

      try {
        const res = await fetch(
          `/api/chat/sync?lastSync=${encodeURIComponent(lastSyncRef.current)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.serverTime) {
            lastSyncRef.current = data.serverTime;
          }
          if (data.leads && data.leads.length > 0) {
            mergeUpdatedLeads(data.leads);
          }
        }
      } catch {
        // Silently retry on next tick
      }

      if (!isCancelled) {
        timeoutId = setTimeout(syncLeads, 2000);
      }
    };

    timeoutId = setTimeout(syncLeads, 2000);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [mergeUpdatedLeads]);

  const displayLeads = leads.length > 0 ? leads : initialLeads;

  const filteredLeads = displayLeads.filter((lead) => {
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
    // If clicking the currently active conversation, toggle it closed
    if (activeLead?._id === lead._id) {
      setActiveLead(null);
      return;
    }

    // Otherwise, select and open the conversation
    setActiveLead(lead);
    if (lead.unreadCount && lead.unreadCount > 0) {
      updateLeadInStore({ _id: lead._id!, unreadCount: 0 });
      await markChatAsRead(lead._id!);
    }
  };

  // 1. Toggle Unread status
  const handleToggleUnread = async (lead: ILead) => {
    setActiveMenuLeadId(null);
    const hasUnread = (lead.unreadCount || 0) > 0;
    if (hasUnread) {
      updateLeadInStore({ _id: lead._id!, unreadCount: 0 });
      toast.info("Marked as Read", `Conversation with ${lead.name} marked as read`);
      await markChatAsRead(lead._id!);
    } else {
      updateLeadInStore({ _id: lead._id!, unreadCount: 1 });
      toast.info("Marked as Unread", `Conversation with ${lead.name} marked as unread`);
      await markChatAsUnread(lead._id!);
    }
  };

  // 2. Toggle Mute / Unmute
  const handleToggleMute = async (lead: ILead) => {
    setActiveMenuLeadId(null);
    const nextMuted = !lead.isMuted;
    updateLeadInStore({ _id: lead._id!, isMuted: nextMuted });
    toast.success(
      nextMuted ? "Chat Muted" : "Chat Unmuted",
      nextMuted
        ? `Notifications silenced for ${lead.name}`
        : `Notifications enabled for ${lead.name}`
    );
    await toggleMuteChat(lead._id!, nextMuted);
  };

  // 3. Toggle Block / Unblock Contact
  const handleToggleBlock = async (lead: ILead) => {
    setActiveMenuLeadId(null);
    const nextBlocked = !lead.isBlocked;
    updateLeadInStore({ _id: lead._id!, isBlocked: nextBlocked });
    toast.success(
      nextBlocked ? "Contact Blocked" : "Contact Unblocked",
      nextBlocked
        ? `${lead.name} has been blocked from messaging`
        : `${lead.name} has been unblocked`
    );
    await toggleBlockContact(lead._id!, nextBlocked);
  };

  // 4. Confirm Clear Messages
  const handleConfirmClear = async () => {
    if (!targetLead?._id) return;
    setIsProcessingAction(true);
    try {
      await clearChatMessages(targetLead._id);
      if (activeLead?._id === targetLead._id) {
        setMessages([]);
      }
      updateLeadInStore({
        _id: targetLead._id,
        lastMessage: "",
        unreadCount: 0,
      });
      toast.success("Messages Cleared", `Chat history with ${targetLead.name} has been erased`);
      setShowClearModal(false);
      setTargetLead(null);
    } catch {
      toast.error("Action Failed", "Could not clear messages");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 5. Confirm Delete Entire Chat & Lead
  const handleConfirmDelete = async () => {
    if (!targetLead?._id) return;
    setIsProcessingAction(true);
    try {
      await deleteChat(targetLead._id);
      removeLeadFromStore(targetLead._id);
      toast.success("Chat Deleted", `Conversation and contact ${targetLead.name} removed`);
      setShowDeleteModal(false);
      setTargetLead(null);
    } catch {
      toast.error("Action Failed", "Could not delete conversation");
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <>
      <div
        className={`w-full md:w-72 lg:w-80 flex-col h-full min-h-0 neu-sidebar shrink-0 text-slate-800 ${
          activeLead ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/70 bg-white shrink-0 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl neu-pressed text-blue-600 flex items-center justify-center font-bold bg-[#f1f5f9] shrink-0">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:base font-bold text-slate-900 truncate">WhatsApp Inbox</h2>
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
          className="flex-1 min-h-0 overflow-y-auto chat-scrollbar divide-y divide-slate-200/50 overscroll-contain"
        >
          {filteredLeads.map((lead) => {
            const isSelected = activeLead?._id === lead._id;
            const isMenuOpen = activeMenuLeadId === lead._id;
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
                          setActiveMenuLeadId(isMenuOpen ? null : lead._id!);
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
                      onClick={() => handleToggleUnread(lead)}
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
                      onClick={() => handleToggleMute(lead)}
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
                      onClick={() => handleToggleBlock(lead)}
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
                      onClick={() => {
                        setTargetLead(lead);
                        setShowClearModal(true);
                        setActiveMenuLeadId(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-medium text-slate-700 transition-colors cursor-pointer text-left"
                    >
                      <Eraser className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Clear chat messages</span>
                    </button>

                    {/* Delete Conversation */}
                    <button
                      type="button"
                      onClick={() => {
                        setTargetLead(lead);
                        setShowDeleteModal(true);
                        setActiveMenuLeadId(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-rose-50 flex items-center gap-2 font-medium text-rose-600 transition-colors cursor-pointer text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">Delete chat</span>
                    </button>
                  </div>
                )}
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

      {/* Delete Conversation Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isProcessingAction) setShowDeleteModal(false);
        }}
        title="Delete Conversation?"
        description="Permanently remove conversation and contact profile."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Permanent Deletion</p>
              <p className="mt-0.5 text-rose-700 leading-relaxed">
                Are you sure you want to delete <strong>{targetLead?.name}</strong> and all chat messages? This action cannot be reversed.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isProcessingAction}
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 neu-btn rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessingAction}
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isProcessingAction ? "Deleting..." : "Delete Chat"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear Chat Messages Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => {
          if (!isProcessingAction) setShowClearModal(false);
        }}
        title="Clear Chat Messages?"
        description="Erase all messages while keeping contact details intact."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            All messages exchanged with <strong>{targetLead?.name}</strong> will be erased. The lead contact details, deal value, and pipeline stage will be preserved.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isProcessingAction}
              onClick={() => setShowClearModal(false)}
              className="px-4 py-2 neu-btn rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessingAction}
              onClick={handleConfirmClear}
              className="px-4 py-2 neu-btn-primary text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{isProcessingAction ? "Clearing..." : "Clear Messages"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
