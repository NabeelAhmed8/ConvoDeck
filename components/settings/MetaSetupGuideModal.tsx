"use client";

import React from "react";
import { BookOpen, X, ExternalLink, CheckCircle2, ArrowRight } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm pointer-events-auto animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official Meta Cloud API Setup Guide
              </h3>
              <p className="text-xs text-slate-500">
                How to get your credentials from Meta for Developers in 3 simple steps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">1</span>
                Get Phone Number ID &amp; Access Token
              </span>
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-semibold flex items-center gap-1 hover:underline text-[11px]"
              >
                Meta Apps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-500">
              Go to Meta for Developers &gt; select your App &gt; click <strong>WhatsApp &gt; API Setup</strong> on the left menu.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Copy the <strong>Phone Number ID</strong> (e.g. 108492019482910).</li>
              <li>Copy the <strong>Access Token</strong> (or generate a permanent token in Business Settings &gt; System Users).</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">2</span>
              Configure Webhook in Meta Console
            </span>
            <p className="text-slate-500">
              In Meta Developers, go to <strong>WhatsApp &gt; Configuration</strong> and click <strong>Edit</strong> under Webhook:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Callback URL:</strong> Paste your ConvoDeck Webhook Callback URL shown in Settings.</li>
              <li><strong>Verify Token:</strong> Paste your ConvoDeck Verify Token (e.g. <code>cd_...</code>).</li>
              <li>Click <strong>Verify and Save</strong>.</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">3</span>
              Subscribe to &ldquo;messages&rdquo; Webhook Field
            </span>
            <p className="text-slate-500">
              Under Webhook fields on the same page, find the row named <strong>messages</strong> and click <strong>Subscribe</strong>.
            </p>
            <p className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Done! Real-time messages will now instantly sync with ConvoDeck.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-black transition-colors cursor-pointer"
          >
            Got it, Let&apos;s Connect
          </button>
        </div>
      </div>
    </div>
  );
}
