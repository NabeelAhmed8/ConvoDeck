"use client";

import React, { useEffect, useRef } from "react";
import { Check, CheckCheck } from "lucide-react";
import { ILead, IMessage } from "@/types";

interface ChatMessageListProps {
  activeLead: ILead;
  messages: IMessage[];
  isLoadingMessages: boolean;
}

export function ChatMessageList({
  activeLead,
  messages,
  isLoadingMessages,
}: ChatMessageListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevLeadIdRef = useRef<string | null>(null);
  const prevMessagesCountRef = useRef<number>(0);
  const initialScrolledLeadIdRef = useRef<string | null>(null);

  // Helper to scroll messages container reliably across mobile & desktop
  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    if (messagesContainerRef.current) {
      if (behavior === "auto") {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
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
  }, [activeLead._id]);

  // 1. Initial Instant Snap to Bottom on Open / Lead Switch / Load Complete
  useEffect(() => {
    if (!activeLead._id || isLoadingMessages) return;

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
  }, [activeLead._id, isLoadingMessages, messages.length]);

  // 2. Smooth Auto-Scroll for New Incoming or Outgoing Messages during active conversation
  useEffect(() => {
    const isSameLead = prevLeadIdRef.current === activeLead._id;
    const isNewMessage = messages.length > prevMessagesCountRef.current;

    // Only smooth scroll if initial snap has already happened for this lead
    if (
      isSameLead &&
      isNewMessage &&
      !isLoadingMessages &&
      initialScrolledLeadIdRef.current === activeLead._id
    ) {
      const timer = setTimeout(() => {
        scrollToBottom("smooth");
      }, 30);
      return () => clearTimeout(timer);
    }

    prevLeadIdRef.current = activeLead._id || null;
    prevMessagesCountRef.current = messages.length;
  }, [messages.length, activeLead._id, isLoadingMessages]);

  return (
    <div
      ref={messagesContainerRef}
      role="log"
      aria-live="polite"
      aria-label="Chat messages history"
      className="flex-1 min-h-0 overflow-y-auto chat-messages-stream chat-scrollbar p-2.5 sm:p-4 space-y-2.5 overscroll-contain"
    >
      {isLoadingMessages ? (
        <div className="flex justify-center py-8 text-xs text-slate-500">
          Loading chat history...
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-slate-500">
          <p>No messages in this chat yet.</p>
          <p className="mt-1 text-[11px]">
            Type below to send a message to +{activeLead.phone} on WhatsApp.
          </p>
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
                className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-3.5 py-2 relative text-xs leading-relaxed ${
                  isAgent
                    ? "neu-card bg-[#eff6ff] text-slate-900 rounded-tr-none border-l-4 border-l-blue-600 shadow-sm"
                    : "neu-card bg-white text-slate-900 rounded-tl-none shadow-sm"
                }`}
              >
                {isAgent && (
                  <span className="block text-[10px] font-bold text-blue-600 mb-0.5">
                    {msg.agentName
                      ? `✓ ${msg.agentName}`
                      : msg.senderName || "Sales Agent"}
                  </span>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500">
                  <span suppressHydrationWarning>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isAgent && (
                    <span>
                      {msg.status === "read" ? (
                        <CheckCheck
                          className="w-3.5 h-3.5 text-blue-600"
                          aria-label="Read"
                        />
                      ) : msg.status === "delivered" ? (
                        <CheckCheck
                          className="w-3.5 h-3.5 text-slate-500"
                          aria-label="Delivered"
                        />
                      ) : (
                        <Check
                          className="w-3.5 h-3.5 text-slate-400"
                          aria-label="Sent"
                        />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
