"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/useChatStore";
import { getMessages } from "@/actions/chatActions";
import { ILead, IMessage } from "@/types";
import { playIncomingMessageSound, getChatBroadcastChannel } from "@/lib/syncUtils";

export function useChatSync(activeLead: ILead | null) {
  const {
    setMessages,
    appendMessages,
    updateMessageStatuses,
    mergeUpdatedLeads,
    setIsLoadingMessages,
  } = useChatStore();

  const lastMessageTimestampRef = useRef<string>("");
  const lastLeadSyncRef = useRef<string>(new Date().toISOString());

  // Load chat history when activeLead changes
  useEffect(() => {
    if (!activeLead?._id) return;

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

          // Ingest new messages from mobile/laptop or WhatsApp
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

          // Ingest status changes (e.g. sent -> delivered -> read)
          if (data.statusUpdates && data.statusUpdates.length > 0) {
            updateMessageStatuses(data.statusUpdates);
          }

          // Ingest updated leads
          if (data.leads && data.leads.length > 0) {
            mergeUpdatedLeads(data.leads);
          }
        }
      } catch {
        // Silently retry next cycle
      }

      if (!isCancelled) {
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

    timeoutId = setTimeout(pollSync, 800);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [
    activeLead?._id,
    activeLead?.isMuted,
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
}
