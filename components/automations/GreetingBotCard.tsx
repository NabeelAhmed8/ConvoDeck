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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[4px_4px_16px_rgba(160,178,204,0.15)] transition-all">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-[#ff6422] flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>WhatsApp Auto-Greeting</span>
              {enabled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Active
                </span>
              )}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-0.5">
              Welcomes new inbound WhatsApp leads on their first incoming message.
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
            <Zap className="w-3.5 h-3.5 text-[#ff6422] shrink-0" />
            <span>Greeting Response Message</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => onChangeMessage(e.target.value)}
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff6422]/20 focus:border-[#ff6422] transition-all resize-none leading-relaxed"
            placeholder="Enter the automated welcome message..."
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Sent automatically on first inbound message.</span>
            <span>{message.length} chars</span>
          </div>
        </div>
      )}
    </div>
  );
}
