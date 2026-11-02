"use client";

import React, { useState } from "react";
import { Phone } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { sendMessage, toggleBlockContact } from "@/actions/chatActions";
import { updateLeadStage } from "@/actions/leadActions";
import { IMessage, LeadStage } from "@/types";
import { toast } from "@/store/useToastStore";
import { useChatSync } from "@/hooks/useChatSync";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatLeadDrawer } from "@/components/chat/ChatLeadDrawer";

export function ChatWindow() {
  const {
    activeLead,
    setActiveLead,
    messages,
    addMessage,
    replaceOptimisticMessage,
    updateLeadInStore,
    isLoadingMessages,
    isSending,
    setIsSending,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);

  // Hook for 0-delay real-time delta sync & broadcast channel
  useChatSync(activeLead);

  // Send message from agent to customer WhatsApp
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeLead?._id || isSending) return;

    const currentText = inputText.trim();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setInputText("");
    setIsSending(true);
    setApiWarning(null);

    // Optimistic UI addition (0 delay)
    const tempMsg: IMessage & { tempId?: string } = {
      _id: tempId,
      tempId,
      leadId: activeLead._id,
      workspaceId: activeLead.workspaceId || "default",
      sender: "agent",
      senderName: "You",
      text: currentText,
      type: "text",
      status: "sent",
      createdAt: new Date(),
    };
    addMessage(tempMsg);

    updateLeadInStore({
      _id: activeLead._id,
      lastMessage: currentText,
      lastMessageAt: new Date(),
    });

    const res = await sendMessage({
      leadId: activeLead._id,
      text: currentText,
    });
    setIsSending(false);

    if (res.success && res.message) {
      replaceOptimisticMessage(tempId, res.message);
      if (res.apiWarning) {
        setApiWarning(res.apiWarning);
      }
    } else {
      toast.error("Send Failed", res.error || "Unable to deliver message");
    }
  };

  const handleStageChange = async (newStage: LeadStage) => {
    if (!activeLead?._id) return;
    updateLeadInStore({ _id: activeLead._id, stage: newStage });
    toast.success("Lead Stage Updated", `Stage moved to ${newStage}`);
    await updateLeadStage(activeLead._id, newStage);
  };

  const handleUnblockContact = async () => {
    if (!activeLead?._id) return;
    updateLeadInStore({ _id: activeLead._id, isBlocked: false });
    toast.success("Contact Unblocked", `${activeLead.name} has been unblocked`);
    await toggleBlockContact(activeLead._id, false);
  };

  if (!activeLead) {
    return (
      <div className="hidden md:flex flex-1 min-w-0 min-h-0 flex-col items-center justify-center p-6 text-center text-slate-600 bg-[#f0f4fa]">
        <div className="w-16 h-16 rounded-2xl neu-pressed text-blue-600 flex items-center justify-center mb-4 bg-white">
          <Phone className="w-8 h-8" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Conversation Selected</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Select a customer from the left inbox list to view messages and collaborate with your team.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex overflow-hidden bg-[#f0f4fa]">
      <div className="flex-1 min-w-0 min-h-0 flex flex-col relative overflow-hidden overscroll-none">
        {/* Pinned Top Bar */}
        <ChatHeader
          activeLead={activeLead}
          showDrawer={showDrawer}
          setShowDrawer={setShowDrawer}
          onClose={() => setActiveLead(null)}
          onStageChange={handleStageChange}
        />

        {/* Message Stream */}
        <ChatMessageList
          activeLead={activeLead}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
        />

        {/* Anchored Input Bar */}
        <ChatInput
          activeLead={activeLead}
          inputText={inputText}
          setInputText={setInputText}
          isSending={isSending}
          apiWarning={apiWarning}
          onSendMessage={handleSendMessage}
          onUnblockContact={handleUnblockContact}
        />
      </div>

      {/* CRM Customer Details Drawer */}
      <ChatLeadDrawer
        activeLead={activeLead}
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
      />
    </div>
  );
}
