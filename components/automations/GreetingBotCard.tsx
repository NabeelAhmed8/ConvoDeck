"use client";

import React from "react";
import { MessageSquare, Zap } from "lucide-react";

interface GreetingBotCardProps {
  enabled: boolean;
  message: string;
  onToggle: (enabled: boolean) => void;
  onChangeMessage: (msg: string) => void;
}

export function GreetingBotCard({
  enabled,
  message,
  onToggle,
  onChangeMessage,
}: GreetingBotCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[4px_4px_16px_rgba(160,178,204,0.15)] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff6422] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              WhatsApp Auto-Greeting
              {enabled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Instantly welcomes new inbound WhatsApp leads on their first incoming message.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enabled ? "bg-[#ff6422]" : "bg-slate-300"
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#ff6422]" />
            Greeting Response Message
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => onChangeMessage(e.target.value)}
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff6422]/20 focus:border-[#ff6422] transition-all resize-none"
            placeholder="Enter the automated welcome message..."
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Sent automatically to any new number messaging your WhatsApp Business account.
          </p>
        </div>
      )}
    </div>
  );
}
