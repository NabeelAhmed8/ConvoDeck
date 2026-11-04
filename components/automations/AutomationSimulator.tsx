"use client";

import React, { useState } from "react";
import { Play, Sparkles, CheckCircle, ArrowRight, UserCheck, Tag, MessageSquare } from "lucide-react";
import { testAutomationSimulator } from "@/actions/automationActions";
import { AutomationExecutionResult } from "@/types/automation";

export function AutomationSimulator() {
  const [sampleText, setSampleText] = useState(
    "Hi, we need to schedule a product demo for our sales team. Also please share enterprise pricing."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomationExecutionResult | null>(null);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleText.trim() || isLoading) return;

    setIsLoading(true);
    const res = await testAutomationSimulator(sampleText.trim());
    setIsLoading(false);

    if (res.success && res.result) {
      setResult(res.result);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-[4px_4px_16px_rgba(160,178,204,0.15)] transition-all">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-100 text-[#ff6422] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">Interactive Automation Sandbox</h3>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Type any sample WhatsApp message to simulate rule executions live.
          </p>
        </div>
      </div>

      <form onSubmit={handleRunSimulation} className="mt-3 sm:mt-4 space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Type a sample customer WhatsApp message..."
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff6422]/20 focus:border-[#ff6422] resize-none leading-relaxed"
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-600 pointer-events-none">
            {sampleText.length} chars
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSampleText("Can we book a live zoom demo tomorrow?")}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              📅 Demo
            </button>
            <button
              type="button"
              onClick={() => setSampleText("URGENT: our login is broken, please refund immediately!")}
              className="text-[11px] px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
            >
              🚨 Urgent
            </button>
            <button
              type="button"
              onClick={() => setSampleText("I want to speak with a human agent please")}
              className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
            >
              👤 Human Handoff
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !sampleText.trim()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#ff6422] text-white text-xs font-bold hover:bg-[#e0551a] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isLoading ? "Simulating..." : "Test Rules"}</span>
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 bg-slate-50/80 p-3 sm:p-4 rounded-xl border border-slate-200/60 transition-all animate-fadeIn">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              Simulation Result
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {result.triggeredRules.length} rule(s) fired
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {result.stageUpdated && (
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-900 flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  Stage Move: <strong>NEW → {result.stageUpdated}</strong>
                </span>
              </div>
            )}

            {result.tagsAdded.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-900 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Tags: <strong>{result.tagsAdded.join(", ")}</strong></span>
              </div>
            )}

            {result.assignedAgentName && (
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200/60 text-purple-900 flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Routing: <strong>{result.assignedAgentName}</strong></span>
              </div>
            )}

            {result.autoReplied && result.autoReplyText && (
              <div className="col-span-full p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-900 flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold">WhatsApp Auto-Response:</span>
                  <p className="mt-0.5 text-slate-700 italic break-words">"{result.autoReplyText}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
