"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  UserPlus,
  Phone,
  Building2,
  Check,
  Loader2,
  MessageSquare,
  Users,
} from "lucide-react";
import { ILead, LeadStage } from "@/types";
import { createLead } from "@/actions/leadActions";
import { toast } from "@/store/useToastStore";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: ILead[];
  onSelectContact: (contact: ILead) => void;
}

const STAGE_COLORS: Record<LeadStage, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-amber-50 text-amber-700 border-amber-200",
  DEMO_SCHEDULED: "bg-purple-50 text-purple-700 border-purple-200",
  PROPOSAL_SENT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  WON: "bg-emerald-50 text-emerald-800 border-emerald-200",
  LOST: "bg-rose-50 text-rose-700 border-rose-200",
};

export function NewChatModal({
  isOpen,
  onClose,
  contacts,
  onSelectContact,
}: NewChatModalProps) {
  const [search, setSearch] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Filter existing contacts based on search query
  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const matchName = c.name?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchCompany = c.company?.toLowerCase().includes(q);
      return matchName || matchPhone || matchCompany;
    });
  }, [contacts, search]);

  if (!isOpen) return null;

  // Handle direct message to a new phone number
  const handleCreateNewContactChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = newPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 7) {
      toast.error("Invalid Phone", "Please enter a valid phone number with country code.");
      return;
    }

    setIsCreating(true);
    try {
      const finalName = newName.trim() || `+${cleanPhone}`;
      const res = await createLead({
        name: finalName,
        phone: cleanPhone,
        stage: "NEW",
        tags: ["Direct WhatsApp"],
      });

      if (res.success && res.lead) {
        toast.success("Chat Started", `Opened conversation with ${finalName}`);
        onSelectContact(res.lead);
        onClose();
      } else {
        toast.error("Failed", res.error || "Could not start chat");
      }
    } catch {
      toast.error("Error", "An unexpected error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-[#128C7E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">New Chat</h3>
              <p className="text-[11px] text-emerald-100">
                {contacts.length} existing customer contacts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search existing customer by name or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Quick Action: Message New Phone Number */}
        <div className="border-b border-slate-100 p-3 shrink-0 bg-white">
          {!isAddingNew ? (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-emerald-50/70 transition group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 block">
                  Message a New Number
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  Start chat with a phone number not saved in contacts
                </span>
              </div>
            </button>
          ) : (
            <form onSubmit={handleCreateNewContactChat} className="space-y-2.5 p-2 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  New Customer Chat
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name (Optional)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp Number (e.g. +92300...)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating || !newPhone.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  <span>Start Chat</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Existing Contacts</span>
            <span>{filteredContacts.length}</span>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No contacts found</p>
              <p className="text-[11px] text-slate-400">Try searching with another name or phone number.</p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const initials = (contact.name || "Customer")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const stageColor =
                STAGE_COLORS[contact.stage as LeadStage] ||
                "bg-slate-50 text-slate-700 border-slate-200";

              return (
                <button
                  key={contact._id}
                  type="button"
                  onClick={() => {
                    onSelectContact(contact);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-100/80 transition text-left cursor-pointer group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                        {contact.name}
                      </span>
                      {contact.stage && (
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${stageColor}`}
                        >
                          {contact.stage}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span className="font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        +{contact.phone?.replace(/\D/g, "")}
                      </span>
                      {contact.company && (
                        <>
                          <span>•</span>
                          <span className="truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            {contact.company}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
