"use client";

import React, { useEffect, useRef, useState } from "react";
import { ILead } from "@/types";
import { useChatStore } from "@/store/useChatStore";
import {
  markChatAsRead,
  markChatAsUnread,
  toggleMuteChat,
  toggleBlockContact,
  clearChatMessages,
  deleteChat,
} from "@/actions/chatActions";
import { getChatBroadcastChannel } from "@/lib/syncUtils";
import { toast } from "@/store/useToastStore";
import { ChatSidebarHeader } from "@/components/chat/ChatSidebarHeader";
import { ChatLeadItem } from "@/components/chat/ChatLeadItem";
import { ChatModals } from "@/components/chat/ChatModals";

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
    setLeads(initialLeads || []);
  }, [initialLeads, setLeads]);

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
  }, [mergeUpdatedLeads, updateLeadInStore]);

  // Background Delta Polling for Leads List
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const pollLeads = async () => {
      try {
        const lastSync = lastSyncRef.current;
        const res = await fetch(
          `/api/chat/sync?lastSync=${encodeURIComponent(lastSync)}`,
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
        // Silently retry next cycle
      }

      if (!isCancelled) {
        const isVisible = typeof document !== "undefined" && !document.hidden;
        timeoutId = setTimeout(pollLeads, isVisible ? 2000 : 5000);
      }
    };

    timeoutId = setTimeout(pollLeads, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [mergeUpdatedLeads]);

  // Context Actions
  const handleToggleUnread = async (lead: ILead) => {
    const currentlyUnread = Boolean(lead.unreadCount && lead.unreadCount > 0);
    const newCount = currentlyUnread ? 0 : 1;
    updateLeadInStore({ _id: lead._id!, unreadCount: newCount });
    setActiveMenuLeadId(null);

    if (currentlyUnread) {
      await markChatAsRead(lead._id!);
      toast.info("Marked as read", `Chat with ${lead.name} marked as read`);
    } else {
      await markChatAsUnread(lead._id!);
      toast.info("Marked as unread", `Chat with ${lead.name} marked as unread`);
    }
  };

  const handleToggleMute = async (lead: ILead) => {
    const nextMuteState = !lead.isMuted;
    updateLeadInStore({ _id: lead._id!, isMuted: nextMuteState });
    setActiveMenuLeadId(null);
    await toggleMuteChat(lead._id!, nextMuteState);
    toast.success(
      nextMuteState ? "Notifications Muted" : "Notifications Unmuted",
      `${lead.name} notifications ${nextMuteState ? "silenced" : "restored"}`
    );
  };

  const handleToggleBlock = async (lead: ILead) => {
    const nextBlockState = !lead.isBlocked;
    updateLeadInStore({ _id: lead._id!, isBlocked: nextBlockState });
    setActiveMenuLeadId(null);
    await toggleBlockContact(lead._id!, nextBlockState);
    toast.info(
      nextBlockState ? "Contact Blocked" : "Contact Unblocked",
      `${lead.name} has been ${nextBlockState ? "blocked" : "unblocked"}`
    );
  };

  const handleConfirmClear = async () => {
    if (!targetLead?._id) return;
    setIsProcessingAction(true);
    const res = await clearChatMessages(targetLead._id);
    setIsProcessingAction(false);
    setShowClearModal(false);

    if (res.success) {
      if (activeLead?._id === targetLead._id) {
        setMessages([]);
      }
      updateLeadInStore({
        _id: targetLead._id,
        lastMessage: "Messages cleared",
        lastMessageAt: new Date(),
        unreadCount: 0,
      });
      toast.success("Messages Cleared", `All messages for ${targetLead.name} erased`);
    } else {
      toast.error("Clear Failed", res.error || "Could not clear messages");
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetLead?._id) return;
    setIsProcessingAction(true);
    const res = await deleteChat(targetLead._id);
    setIsProcessingAction(false);
    setShowDeleteModal(false);

    if (res.success) {
      if (activeLead?._id === targetLead._id) {
        setActiveLead(null);
        setMessages([]);
      }
      removeLeadFromStore(targetLead._id);
      toast.success("Conversation Deleted", `Deleted chat with ${targetLead.name}`);
    } else {
      toast.error("Delete Failed", res.error || "Could not delete chat");
    }
  };

  const handleSelectLead = async (lead: ILead) => {
    setActiveLead(lead);
    if (lead.unreadCount && lead.unreadCount > 0) {
      updateLeadInStore({ _id: lead._id!, unreadCount: 0 });
      await markChatAsRead(lead._id!);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filter === "unread") return (lead.unreadCount || 0) > 0;
    return true;
  });

  return (
    <>
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200/70 bg-white flex flex-col h-full shrink-0 transition-all ${
          activeLead ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header with Search & Filter Tabs */}
        <ChatSidebarHeader
          chatCount={filteredLeads.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
        />

        {/* Leads List */}
        <div
          id="chat-list"
          role="tabpanel"
          className="flex-1 min-h-0 overflow-y-auto chat-scrollbar divide-y divide-slate-200/50 overscroll-contain pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          {filteredLeads.map((lead) => (
            <ChatLeadItem
              key={lead._id}
              lead={lead}
              isSelected={activeLead?._id === lead._id}
              isMenuOpen={activeMenuLeadId === lead._id}
              menuRef={menuRef}
              onSelect={() => handleSelectLead(lead)}
              onToggleMenu={() =>
                setActiveMenuLeadId(
                  activeMenuLeadId === lead._id ? null : lead._id!
                )
              }
              onToggleUnread={() => handleToggleUnread(lead)}
              onToggleMute={() => handleToggleMute(lead)}
              onToggleBlock={() => handleToggleBlock(lead)}
              onRequestClear={() => {
                setTargetLead(lead);
                setShowClearModal(true);
                setActiveMenuLeadId(null);
              }}
              onRequestDelete={() => {
                setTargetLead(lead);
                setShowDeleteModal(true);
                setActiveMenuLeadId(null);
              }}
            />
          ))}

          {filteredLeads.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No chats found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ChatModals
        targetLead={targetLead}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        showClearModal={showClearModal}
        setShowClearModal={setShowClearModal}
        isProcessingAction={isProcessingAction}
        onConfirmDelete={handleConfirmDelete}
        onConfirmClear={handleConfirmClear}
      />
    </>
  );
}
