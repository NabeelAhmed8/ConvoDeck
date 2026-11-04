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
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-4 bg-white transition-all">
      <div className="flex items-start justify-between gap-3 border-b border-slate-300/40 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/50 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
              <span>WhatsApp Auto-Greeting</span>
              {enabled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                  Off
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
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
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#ff6422]" />
            <span>Greeting Response Message</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => onChangeMessage(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none leading-relaxed resize-none"
            placeholder="Enter the automated welcome message..."
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Sent automatically on first message.</span>
            <span>{message.length} chars</span>
          </div>
        </div>
      )}
    </div>
  );
}
