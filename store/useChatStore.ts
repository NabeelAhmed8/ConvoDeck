import { create } from "zustand";
import { ILead, IMessage } from "@/types";

interface ChatState {
  activeLead: ILead | null;
  leads: ILead[];
  messages: IMessage[];
  isLoadingMessages: boolean;
  isSending: boolean;
  searchQuery: string;
  filter: "all" | "unread";

  // Actions
  setActiveLead: (lead: ILead | null) => void;
  setLeads: (leads: ILead[]) => void;
  setMessages: (messages: IMessage[]) => void;
  addMessage: (message: IMessage) => void;
  appendMessages: (newMessages: IMessage[]) => void;
  updateMessageStatuses: (statusUpdates: Array<{ _id: string; status: IMessage["status"] }>) => void;
  replaceOptimisticMessage: (tempId: string, confirmedMessage: IMessage) => void;
  mergeUpdatedLeads: (updatedLeads: ILead[]) => void;
  updateLeadInStore: (updatedLead: Partial<ILead> & { _id: string }) => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: "all" | "unread") => void;
  setIsLoadingMessages: (loading: boolean) => void;
  setIsSending: (sending: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeLead: null,
  leads: [],
  messages: [],
  isLoadingMessages: false,
  isSending: false,
  searchQuery: "",
  filter: "all",

  setActiveLead: (lead) =>
    set((state) => {
      // If closing / deselecting, reset activeLead and clear messages
      if (!lead) {
        return {
          activeLead: null,
          messages: [],
        };
      }

      // If switching to a different lead, clear messages so new history can load cleanly
      if (state.activeLead?._id !== lead._id) {
        return {
          activeLead: lead,
          messages: [],
        };
      }

      // If selecting the already active lead, preserve messages and refresh lead details
      return {
        activeLead: lead,
      };
    }),

  setLeads: (leads) => set({ leads }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  // Deduplicating append for incoming real-time messages
  appendMessages: (newMessages) =>
    set((state) => {
      if (!newMessages || newMessages.length === 0) return state;

      const existingIds = new Set(
        state.messages.map((m) => m._id).filter(Boolean)
      );

      const toAdd: IMessage[] = [];
      for (const msg of newMessages) {
        if (msg._id && existingIds.has(msg._id)) continue;

        // Also check if an identical optimistic message already exists
        const isDuplicateOptimistic = state.messages.some(
          (m) =>
            m.text === msg.text &&
            m.sender === msg.sender &&
            Math.abs(
              new Date(m.createdAt || 0).getTime() -
                new Date(msg.createdAt || 0).getTime()
            ) < 3000
        );

        if (!isDuplicateOptimistic) {
          toAdd.push(msg);
          if (msg._id) existingIds.add(msg._id);
        }
      }

      if (toAdd.length === 0) return state;

      return {
        messages: [...state.messages, ...toAdd],
      };
    }),

  // Update delivery and read statuses for existing messages
  updateMessageStatuses: (statusUpdates) =>
    set((state) => {
      if (!statusUpdates || statusUpdates.length === 0) return state;
      const statusMap = new Map(statusUpdates.map((s) => [s._id, s.status]));

      let hasChanged = false;
      const updatedMessages = state.messages.map((m) => {
        if (m._id && statusMap.has(m._id)) {
          const newStatus = statusMap.get(m._id);
          if (newStatus && m.status !== newStatus) {
            hasChanged = true;
            return { ...m, status: newStatus };
          }
        }
        return m;
      });

      return hasChanged ? { messages: updatedMessages } : state;
    }),

  // Replace temporary optimistic message with confirmed server message
  replaceOptimisticMessage: (tempId, confirmedMessage) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        (m as any).tempId === tempId ? confirmedMessage : m
      ),
    })),

  // Real-time merge of leads from delta-sync (sorts most recent to top)
  mergeUpdatedLeads: (updatedLeads) =>
    set((state) => {
      if (!updatedLeads || updatedLeads.length === 0) return state;

      const leadMap = new Map(state.leads.map((l) => [l._id, l]));

      for (const updated of updatedLeads) {
        if (leadMap.has(updated._id)) {
          leadMap.set(updated._id, { ...leadMap.get(updated._id)!, ...updated });
        } else {
          leadMap.set(updated._id, updated);
        }
      }

      // Sort by latest message time or update time descending
      const sortedLeads = Array.from(leadMap.values()).sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || (a as any).updatedAt || 0).getTime();
        const timeB = new Date(b.lastMessageAt || (b as any).updatedAt || 0).getTime();
        return timeB - timeA;
      });

      // Keep activeLead in sync if updated
      let newActiveLead = state.activeLead;
      if (state.activeLead?._id && leadMap.has(state.activeLead._id)) {
        newActiveLead = { ...state.activeLead, ...leadMap.get(state.activeLead._id)! };
      }

      return {
        leads: sortedLeads,
        activeLead: newActiveLead,
      };
    }),

  updateLeadInStore: (updatedLead) =>
    set((state) => {
      const updatedLeads = state.leads.map((l) =>
        l._id === updatedLead._id ? { ...l, ...updatedLead } : l
      );

      // Re-sort if lastMessageAt updated
      if (updatedLead.lastMessageAt) {
        updatedLeads.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || (a as any).updatedAt || 0).getTime();
          const timeB = new Date(b.lastMessageAt || (b as any).updatedAt || 0).getTime();
          return timeB - timeA;
        });
      }

      return {
        leads: updatedLeads,
        activeLead:
          state.activeLead?._id === updatedLead._id
            ? { ...state.activeLead, ...updatedLead }
            : state.activeLead,
      };
    }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setFilter: (filter) => set({ filter }),

  setIsLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),

  setIsSending: (isSending) => set({ isSending }),
}));
