"use client";

import React from "react";
import { BookOpen, X, ExternalLink, CheckCircle2 } from "lucide-react";

interface MetaSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MetaSetupGuideModal({
  isOpen,
  onClose,
}: MetaSetupGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[82dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-snug">
                Meta Cloud API Setup Guide
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-tight mt-0.5">
                3 simple steps to connect WhatsApp Business
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close setup guide"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps Content - Scrollable flex child */}
        <div className="p-3 sm:p-5 flex-1 min-h-0 overflow-y-auto overscroll-contain chat-scrollbar space-y-2.5 sm:space-y-3.5 text-xs text-slate-600 leading-relaxed">
          {/* Step 1 */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  1
                </span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  Phone ID &amp; Access Token
                </span>
              </div>
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-semibold inline-flex items-center gap-1 hover:underline text-[11px] shrink-0"
              >
                Meta Apps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Go to <strong>Meta for Developers</strong> &gt; Select App &gt; <strong>WhatsApp &gt; API Setup</strong>:
            </p>
            <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 text-[11px] sm:text-xs text-slate-600">
              <li>Copy <strong>Phone Number ID</strong> (e.g. 108492019482910)</li>
              <li>Copy <strong>Access Token</strong> (from API Setup or System Users)</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                2
              </span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Configure Webhook in Meta Console
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              In Meta Developers, go to <strong>WhatsApp &gt; Configuration</strong> and click <strong>Edit</strong> under Webhook:
            </p>
            <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 text-[11px] sm:text-xs text-slate-600">
              <li><strong>Callback URL:</strong> Paste ConvoDeck Callback URL from Settings</li>
              <li><strong>Verify Token:</strong> Paste ConvoDeck Verify Token (<code>cd_...</code>)</li>
              <li>Click <strong>Verify and Save</strong></li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                3
              </span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Subscribe to &ldquo;messages&rdquo; Field
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Under Webhook fields on the same page, find <strong>messages</strong> and click <strong>Subscribe</strong>.
            </p>
            <p className="text-emerald-700 font-semibold flex items-center gap-1.5 pt-0.5 text-[11px] sm:text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>Real-time messages will now sync automatically with ConvoDeck!</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 sm:p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-black transition-colors cursor-pointer text-center"
          >
            Got it, Let&apos;s Connect
          </button>
        </div>
      </div>
    </div>
  );
}
