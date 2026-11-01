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
    set({
      activeLead: lead,
      messages: [], // Reset messages until loaded for new lead
    }),

  setLeads: (leads) => set({ leads }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLeadInStore: (updatedLead) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l._id === updatedLead._id ? { ...l, ...updatedLead } : l
      ),
      activeLead:
        state.activeLead?._id === updatedLead._id
          ? { ...state.activeLead, ...updatedLead }
          : state.activeLead,
    })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setFilter: (filter) => set({ filter }),

  setIsLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),

  setIsSending: (isSending) => set({ isSending }),
}));
