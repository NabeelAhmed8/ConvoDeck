"use client";

import React from "react";
import Link from "next/link";
import { Send, Ban, AlertCircle, Settings } from "lucide-react";
import { ILead } from "@/types";

interface ChatInputProps {
  activeLead: ILead;
  inputText: string;
  setInputText: (text: string) => void;
  isSending: boolean;
  apiWarning: string | null;
  onSendMessage: (e: React.FormEvent) => void;
  onUnblockContact: () => void;
}

export function ChatInput({
  activeLead,
  inputText,
  setInputText,
  isSending,
  apiWarning,
  onSendMessage,
  onUnblockContact,
}: ChatInputProps) {
  return (
    <>
      {/* Blocked Contact Warning Alert */}
      {activeLead.isBlocked && (
        <div
          role="alert"
          className="bg-rose-50 border-b border-rose-200 px-3 py-2 text-xs text-rose-900 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Ban className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
            <span className="truncate">
              This contact is blocked. You cannot send messages until unblocked.
            </span>
          </div>
          <button
            type="button"
            onClick={onUnblockContact}
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
            <span className="truncate">
              WhatsApp account connection required to send messages to this contact.
            </span>
          </div>
          <Link
            href="/settings"
            className="font-bold underline text-amber-700 hover:text-amber-900 flex items-center gap-1 shrink-0 ml-2 text-[11px]"
          >
            <Settings className="w-3 h-3" aria-hidden="true" /> Connect
          </Link>
        </div>
      )}

      {/* Message Input Box - Solidly Anchored with Safe Area Padding */}
      <div className="p-2 sm:p-2.5 bg-white border-t border-slate-200/70 shadow-xs shrink-0 z-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <form onSubmit={onSendMessage} className="flex items-center gap-1.5 sm:gap-2">
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
            className="flex-1 min-w-0 px-3 sm:px-4 py-2 text-sm sm:text-xs neu-input rounded-full text-slate-900 placeholder-slate-400 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending || activeLead.isBlocked}
            aria-label="Send message"
            className="px-3 sm:px-4 py-2 neu-btn-primary disabled:opacity-50 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            <span className="hidden xs:inline">
              {isSending ? "Sending..." : "Send"}
            </span>
          </button>
        </form>
      </div>
    </>
  );
}
