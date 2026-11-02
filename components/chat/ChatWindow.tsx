"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Phone,
  Check,
  CheckCheck,
  Send,
  PanelRightOpen,
  PanelRightClose,
  AlertCircle,
  Settings,
  ArrowLeft,
  X,
  Ban,
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { getMessages, sendMessage, toggleBlockContact } from "@/actions/chatActions";
import { updateLeadStage, updateLead } from "@/actions/leadActions";
import { StageBadge } from "@/components/ui/Badge";
import { IMessage, LeadStage } from "@/types";
import { toast } from "@/store/useToastStore";
import { playIncomingMessageSound, getChatBroadcastChannel } from "@/lib/syncUtils";

export function ChatWindow() {
  const {
    activeLead,
    setActiveLead,
    messages,
    setMessages,
    addMessage,
    appendMessages,
    updateMessageStatuses,
    replaceOptimisticMessage,
    mergeUpdatedLeads,
    updateLeadInStore,
    isLoadingMessages,
    setIsLoadingMessages,
    isSending,
    setIsSending,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [notes, setNotes] = useState("");
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const lastMessageTimestampRef = useRef<string>("");
  const lastLeadSyncRef = useRef<string>(new Date().toISOString());

  // Load chat history when activeLead changes
  useEffect(() => {
    if (!activeLead?._id) return;
    setNotes(activeLead.notes || "");
    setApiWarning(null);

    let isMounted = true;

    const loadHistory = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await getMessages(activeLead._id!);
        if (!isMounted) return;
        setMessages(data);

        if (data && data.length > 0) {
          const latest = data[data.length - 1];
          lastMessageTimestampRef.current = new Date(latest.createdAt).toISOString();
        } else {
          lastMessageTimestampRef.current = new Date().toISOString();
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
      lastLeadSyncRef.current = new Date().toISOString();
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [activeLead?._id, setMessages, setIsLoadingMessages]);

  // Real-Time Delta Sync (Zero-Delay Polling across Mobile and Laptop)
  useEffect(() => {
    if (!activeLead?._id) return;

    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const pollSync = async () => {
      const isVisible = typeof document !== "undefined" && !document.hidden;

      try {
        const afterTime = lastMessageTimestampRef.current;
        const lastSync = lastLeadSyncRef.current;

        const res = await fetch(
          `/api/chat/sync?leadId=${encodeURIComponent(
            activeLead._id!
          )}&after=${encodeURIComponent(afterTime)}&lastSync=${encodeURIComponent(
            lastSync
          )}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const data = await res.json();

          if (data.serverTime) {
            lastLeadSyncRef.current = data.serverTime;
          }

          // 1. Ingest new messages from mobile/laptop or WhatsApp
          if (data.messages && data.messages.length > 0) {
            const incoming: IMessage[] = data.messages;

            // Play incoming notification chime for incoming customer message (if not muted)
            const hasCustomerMessage = incoming.some(
              (m) => m.sender === "customer"
            );
            if (hasCustomerMessage && !activeLead.isMuted) {
              playIncomingMessageSound();
            }

            appendMessages(incoming);

            const newest = incoming[incoming.length - 1];
            if (newest?.createdAt) {
              lastMessageTimestampRef.current = new Date(
                newest.createdAt
              ).toISOString();
            }
          }

          // 2. Ingest status changes (e.g. sent -> delivered -> read)
          if (data.statusUpdates && data.statusUpdates.length > 0) {
            updateMessageStatuses(data.statusUpdates);
          }

          // 3. Ingest updated leads
          if (data.leads && data.leads.length > 0) {
            mergeUpdatedLeads(data.leads);
          }
        }
      } catch {
        // Silently retry next cycle
      }

      if (!isCancelled) {
        // 1000ms when focused, 3500ms when backgrounded
        const nextDelay = isVisible ? 1000 : 3500;
        timeoutId = setTimeout(pollSync, nextDelay);
      }
    };

    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        clearTimeout(timeoutId);
        pollSync();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    // Initial poll after 800ms
    timeoutId = setTimeout(pollSync, 800);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [
    activeLead?._id,
    appendMessages,
    updateMessageStatuses,
    mergeUpdatedLeads,
  ]);

  // Instant 0ms Cross-Tab / Cross-Window Broadcast
  useEffect(() => {
    const channel = getChatBroadcastChannel();
    if (!channel) return;

    const handleBroadcast = (e: MessageEvent) => {
      const data = e.data;
      if (!data) return;

      if (
        data.type === "MESSAGE_SENT" &&
        data.leadId === activeLead?._id &&
        data.message
      ) {
        appendMessages([data.message]);
      }
    };

    channel.addEventListener("message", handleBroadcast);
    return () => {
      channel.removeEventListener("message", handleBroadcast);
      channel.close();
    };
  }, [activeLead?._id, appendMessages]);

  // Auto-scroll refs & state tracking
  const prevLeadIdRef = useRef<string | null>(null);
  const prevMessagesCountRef = useRef<number>(0);
  const initialScrolledLeadIdRef = useRef<string | null>(null);

  // Helper to scroll messages container reliably across mobile & desktop
  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    if (messagesContainerRef.current) {
      if (behavior === "auto") {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      } else {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  // Reset scroll tracker when active lead changes
  useEffect(() => {
    initialScrolledLeadIdRef.current = null;
  }, [activeLead?._id]);

  // 1. Initial Instant Snap to Bottom on Open / Lead Switch / Load Complete
  useEffect(() => {
    if (!activeLead?._id || isLoadingMessages) return;

    if (initialScrolledLeadIdRef.current !== activeLead._id) {
      initialScrolledLeadIdRef.current = activeLead._id;

      // Direct snap
      scrollToBottom("auto");

      // Multiple frames to guarantee scroll position after browser layout paint
      const rafId = requestAnimationFrame(() => scrollToBottom("auto"));
      const t1 = setTimeout(() => scrollToBottom("auto"), 50);
      const t2 = setTimeout(() => scrollToBottom("auto"), 150);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeLead?._id, isLoadingMessages, messages.length]);

  // 2. Smooth Auto-Scroll for New Incoming or Outgoing Messages during active conversation
  useEffect(() => {
    const isSameLead = prevLeadIdRef.current === activeLead?._id;
    const isNewMessage = messages.length > prevMessagesCountRef.current;

    // Only smooth scroll if initial snap has already happened for this lead
    if (
      isSameLead &&
      isNewMessage &&
      !isLoadingMessages &&
      initialScrolledLeadIdRef.current === activeLead?._id
    ) {
      const timer = setTimeout(() => {
        scrollToBottom("smooth");
      }, 30);
      return () => clearTimeout(timer);
    }

    prevLeadIdRef.current = activeLead?._id || null;
    prevMessagesCountRef.current = messages.length;
  }, [messages.length, activeLead?._id, isLoadingMessages]);

  // Handle Real Message Send (Team Agent -> Customer WhatsApp)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeLead?._id || isSending) return;

    const currentText = inputText.trim();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setInputText("");
    setIsSending(true);
    setApiWarning(null);

    // Optimistic UI addition (0 delay display on local device)
    const tempMsg: IMessage & { tempId?: string } = {
      _id: tempId,
      leadId: activeLead._id,
      workspaceId: activeLead.workspaceId,
      sender: "agent",
      senderName: "Sales Agent",
      text: currentText,
      type: "text",
      status: "sent",
      createdAt: new Date(),
    };
    addMessage(tempMsg);

    // Broadcast immediately across all open tabs/windows
    const channel = getChatBroadcastChannel();
    if (channel) {
      channel.postMessage({
        type: "MESSAGE_SENT",
        leadId: activeLead._id,
        message: tempMsg,
      });
    }

    // Update lead preview in local store immediately
    updateLeadInStore({
      _id: activeLead._id,
      lastMessage: currentText,
      lastMessageAt: new Date(),
    });

    // Server Action with Real WhatsApp Cloud API
    const res = await sendMessage({
      leadId: activeLead._id,
      text: currentText,
    });

    if (res.success && res.message) {
      replaceOptimisticMessage(tempId, res.message);
      lastMessageTimestampRef.current = new Date(
        res.message.createdAt
      ).toISOString();

      if (channel) {
        channel.postMessage({
          type: "MESSAGE_SENT",
          leadId: activeLead._id,
          message: res.message,
        });
      }

      if (res.apiWarning) {
        setApiWarning(res.apiWarning);
      }
    } else if (!res.success && res.error) {
      setApiWarning(res.error);
    }

    setIsSending(false);
  };

  // Change lead stage directly from chat header
  const handleStageChange = async (newStage: LeadStage) => {
    if (!activeLead?._id) return;
    updateLeadInStore({ _id: activeLead._id, stage: newStage });
    toast.success("Stage Updated", `${activeLead.name} moved to stage ${newStage.replace(/_/g, " ")}`);
    await updateLeadStage(activeLead._id, newStage);
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!activeLead?._id) return;
    updateLeadInStore({ _id: activeLead._id, notes });
    toast.info("Notes Updated", `Saved internal notes for ${activeLead.name}`);
    await updateLead(activeLead._id, { notes });
  };

  // Unblock contact directly from chat banner
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
    <div className="flex-1 min-w-0 min-h-0 flex h-full overflow-hidden bg-[#f0f4fa]">
      {/* Main Conversation Window */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col h-full relative overflow-hidden">
        {/* Chat Top Bar - Permanently Pinned at Top of Chatbox */}
        <div className="p-2.5 sm:p-3 bg-white border-b border-slate-200/70 flex items-center justify-between z-20 text-slate-900 rounded-none shadow-xs shrink-0 sticky top-0">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setActiveLead(null)}
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
              onChange={(e) => handleStageChange(e.target.value as LeadStage)}
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
              onClick={() => setActiveLead(null)}
              aria-label="Close conversation"
              title="Close conversation"
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 neu-btn rounded-full cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Blocked Contact Warning Alert */}
        {activeLead.isBlocked && (
          <div
            role="alert"
            className="bg-rose-50 border-b border-rose-200 px-3 py-2 text-xs text-rose-900 flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Ban className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
              <span className="truncate">This contact is blocked. You cannot send messages until unblocked.</span>
            </div>
            <button
              type="button"
              onClick={handleUnblockContact}
              className="font-bold underline text-rose-700 hover:text-rose-900 flex items-center gap-1 shrink-0 ml-2 text-[11px] cursor-pointer"
            >
              Unblock
            </button>
          </div>
        )}

        {/* Friendly Setup Alert if WhatsApp credentials are not yet entered */}
        {apiWarning && (
          <div
            role="alert"
            className="bg-amber-100 border-b border-amber-300 px-3 py-2 text-xs text-amber-900 flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
              <span className="truncate">WhatsApp account connection required to send messages to this contact.</span>
            </div>
            <Link
              href="/settings"
              className="font-bold underline text-amber-700 hover:text-amber-900 flex items-center gap-1 shrink-0 ml-2 text-[11px]"
            >
              <Settings className="w-3 h-3" aria-hidden="true" /> Connect
            </Link>
          </div>
        )}

        {/* Messages Stream Container with Native Tactile Neumorphic Scrollbar */}
        <div className="flex-1 min-h-0 relative flex flex-col">
          <div
            ref={messagesContainerRef}
            role="log"
            aria-live="polite"
            aria-label="Chat messages history"
            className="flex-1 min-h-0 overflow-y-auto chat-messages-stream chat-scrollbar p-3 sm:p-4 space-y-3 overscroll-contain"
          >
            {isLoadingMessages ? (
              <div className="flex justify-center py-8 text-xs text-slate-500">
                Loading chat history...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-slate-500">
                <p>No messages in this chat yet.</p>
                <p className="mt-1 text-[11px]">Type below to send a message to +{activeLead.phone} on WhatsApp.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isAgent = msg.sender === "agent";
                return (
                  <div
                    key={msg._id || idx}
                    className={`flex flex-col ${
                      isAgent ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-2.5 relative text-xs leading-relaxed ${
                        isAgent
                          ? "neu-card bg-[#eff6ff] text-slate-900 rounded-tr-none border-l-4 border-l-blue-600 shadow-sm"
                          : "neu-card bg-white text-slate-900 rounded-tl-none shadow-sm"
                      }`}
                    >
                      {isAgent && (
                        <span className="block text-[10px] font-bold text-blue-600 mb-0.5">
                          {msg.agentName ? `✓ ${msg.agentName}` : msg.senderName || "Sales Agent"}
                        </span>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500">
                        <span suppressHydrationWarning>
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                        {isAgent && (
                          <span>
                            {msg.status === "read" ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-600" aria-label="Read" />
                            ) : msg.status === "delivered" ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-500" aria-label="Delivered" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-500" aria-label="Sent" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input Box */}
        <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200/70 shadow-xs shrink-0 sticky bottom-0 z-10">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <label htmlFor="chat-message-input" className="sr-only">
              Type WhatsApp message
            </label>
            <input
              id="chat-message-input"
              name="messageText"
              type="text"
              autoComplete="off"
              disabled={activeLead.isBlocked || isSending}
              aria-label={`Send WhatsApp message to ${activeLead.name}`}
              placeholder={
                activeLead.isBlocked
                  ? "Contact is blocked. Click Unblock above to send messages..."
                  : `Send message to +${activeLead.phone}...`
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 min-w-0 px-3.5 sm:px-4 py-2 sm:py-2.5 text-base sm:text-xs neu-input rounded-full text-slate-900 placeholder-slate-400 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending || activeLead.isBlocked}
              aria-label="Send message"
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 neu-btn-primary disabled:opacity-50 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span className="hidden xs:inline">{isSending ? "Sending..." : "Send"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right CRM Lead Drawer */}
      {showDrawer && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-20 xl:hidden animate-in fade-in"
            onClick={() => setShowDrawer(false)}
          />
          <aside
            aria-label="Customer profile details"
            className="fixed inset-y-0 right-0 z-30 w-80 max-w-[85vw] bg-white p-4 overflow-y-auto chat-scrollbar space-y-4 shadow-2xl xl:static xl:w-80 xl:shadow-none xl:border-l xl:border-slate-200/70 animate-in slide-in-from-right duration-150 text-slate-800 shrink-0"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">Customer Details</h4>
              <div className="flex items-center gap-2">
                <StageBadge stage={activeLead.stage} />
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  aria-label="Close details"
                  className="xl:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Customer Name
                </span>
                <p className="font-bold text-slate-900">{activeLead.name}</p>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  WhatsApp Phone
                </span>
                <p className="font-medium text-emerald-600">+{activeLead.phone}</p>
              </div>

              {activeLead.email && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Email
                  </span>
                  <p className="text-slate-700">{activeLead.email}</p>
                </div>
              )}

              {activeLead.company && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Company
                  </span>
                  <p className="text-slate-700">{activeLead.company}</p>
                </div>
              )}

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Deal Value
                </span>
                <p className="font-bold text-emerald-600 font-mono text-sm">
                  ${activeLead.dealValue?.toLocaleString() || "0"}
                </p>
              </div>

              <div>
                <label
                  htmlFor="customer-internal-notes"
                  className="text-slate-500 block text-[10px] uppercase font-semibold mb-1"
                >
                  Internal Sales Notes
                </label>
                <textarea
                  id="customer-internal-notes"
                  name="customerNotes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleSaveNotes}
                  placeholder="Add meeting notes, customer preferences..."
                  className="w-full p-3 neu-input rounded-2xl text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">
                  Notes auto-save when you click away.
                </span>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
