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
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { getMessages, sendMessage } from "@/actions/chatActions";
import { updateLeadStage, updateLead } from "@/actions/leadActions";
import { StageBadge } from "@/components/ui/Badge";
import { IMessage, LeadStage } from "@/types";
import { toast } from "@/store/useToastStore";

export function ChatWindow() {
  const {
    activeLead,
    setActiveLead,
    messages,
    setMessages,
    addMessage,
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
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);

  const [scrollInfo, setScrollInfo] = useState({
    hasScroll: true,
    top: 0,
    thumbHeight: 48,
  });

  const updateScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight > clientHeight + 4) {
      // 16px is total vertical padding (top-2 + bottom-2 = 8px + 8px)
      const trackHeight = clientHeight - 16;
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
    const el = messagesContainerRef.current;
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
    if (messagesContainerRef.current) {
      startScroll.current = messagesContainerRef.current.scrollTop;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || !messagesContainerRef.current || !trackRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    const track = trackRef.current;
    const el = messagesContainerRef.current;
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
    if (messagesContainerRef.current) {
      startScroll.current = messagesContainerRef.current.scrollTop;
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !messagesContainerRef.current || !trackRef.current) return;
      moveEvent.preventDefault();
      const deltaY = moveEvent.clientY - startY.current;
      const track = trackRef.current;
      const el = messagesContainerRef.current;
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

  // Load chat history when activeLead changes
  useEffect(() => {
    if (!activeLead?._id) return;
    setNotes(activeLead.notes || "");
    setApiWarning(null);

    const loadHistory = async () => {
      setIsLoadingMessages(true);
      const data = await getMessages(activeLead._id!);
      setMessages(data);
      setIsLoadingMessages(false);
      setTimeout(updateScroll, 100);
    };

    loadHistory();
  }, [activeLead?._id, setMessages, setIsLoadingMessages]);

  // Auto-scroll to bottom of chat and recalculate scrollbar
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const timer = setTimeout(updateScroll, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Observe container resizes (e.g. keyboard show/hide, window resize)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    updateScroll();

    const observer = new ResizeObserver(() => {
      updateScroll();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [messages]);

  // Handle Real Message Send (Team Agent -> Customer WhatsApp)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeLead?._id || isSending) return;

    const currentText = inputText.trim();
    setInputText("");
    setIsSending(true);
    setApiWarning(null);

    // Optimistic UI addition
    const tempMsg: IMessage = {
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

    // Server Action with Real WhatsApp Cloud API
    const res = await sendMessage({
      leadId: activeLead._id,
      text: currentText,
    });

    if (res.success && res.message) {
      updateLeadInStore({
        _id: activeLead._id,
        lastMessage: currentText,
        lastMessageAt: new Date(),
      });
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
      <div className="flex-1 min-w-0 min-h-0 flex flex-col h-full relative">
        {/* Chat Top Bar */}
        <div className="p-2.5 sm:p-3 bg-white border-b border-slate-200/70 flex items-center justify-between z-10 text-slate-900 rounded-none shadow-xs shrink-0">
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
          </div>
        </div>

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

        {/* Messages Stream Container with Guaranteed Interactive Scrollbar Rail */}
        <div className="flex-1 min-h-0 relative flex flex-col">
          <div
            ref={messagesContainerRef}
            onScroll={updateScroll}
            role="log"
            aria-live="polite"
            aria-label="Chat messages history"
            className="flex-1 min-h-0 overflow-y-scroll chat-messages-stream p-3 pr-5 sm:p-4 sm:pr-6 space-y-3 overscroll-contain"
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

          {/* True Neumorphic Interactive Scrollbar (Tactile Extruded Thumb & Debossed Well) */}
          {messages.length > 0 && scrollInfo.hasScroll && (
            <div
              className="absolute right-1.5 top-2.5 bottom-2.5 w-3 sm:w-3.5 z-20 flex flex-col justify-start items-center py-0.5 select-none"
            >
              {/* Tactile Inset / Debossed Track Groove */}
              <div
                ref={trackRef}
                onClick={handleTrackClick}
                title="Click or drag to scroll chat"
                className="w-2 sm:w-2.5 h-full rounded-full bg-[#ebf1f8] shadow-[inset_2px_2px_4px_#c9d6e7,inset_-2px_-2px_4px_#ffffff] border border-slate-300/50 relative cursor-pointer"
              >
                {/* Extruded Neumorphic Tactile Knob Thumb */}
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
                  {/* Subtle Tactile Ridge / Grip Line */}
                  <span className="w-0.5 sm:w-1 h-3.5 rounded-full bg-slate-400/50 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.15)] group-hover:bg-blue-600/70 group-active:bg-blue-600 transition-colors pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input Box */}
        <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200/70 shadow-xs shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <label htmlFor="chat-message-input" className="sr-only">
              Type WhatsApp message
            </label>
            <input
              id="chat-message-input"
              name="messageText"
              type="text"
              autoComplete="off"
              aria-label={`Send WhatsApp message to ${activeLead.name}`}
              placeholder={`Send message to +${activeLead.phone}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 min-w-0 px-3.5 sm:px-4 py-2 sm:py-2.5 text-base sm:text-xs neu-input rounded-full text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
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
