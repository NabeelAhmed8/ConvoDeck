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
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-4 bg-white transition-all">
      <div className="flex items-center gap-3 border-b border-slate-300/40 pb-3">
        <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/50 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900">Interactive Automation Sandbox</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test any sample WhatsApp message to simulate rule executions live.
          </p>
        </div>
      </div>

      <form onSubmit={handleRunSimulation} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Type a sample customer WhatsApp message..."
            className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none resize-none leading-relaxed"
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 pointer-events-none">
            {sampleText.length} chars
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSampleText("Can we book a live zoom demo tomorrow?")}
              className="text-[11px] px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors cursor-pointer"
            >
              📅 Demo Example
            </button>
            <button
              type="button"
              onClick={() => setSampleText("URGENT: our login is broken, please refund immediately!")}
              className="text-[11px] px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition-colors cursor-pointer"
            >
              🚨 Urgent Example
            </button>
            <button
              type="button"
              onClick={() => setSampleText("I want to speak with a human agent please")}
              className="text-[11px] px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors cursor-pointer"
            >
              👤 Human Handoff
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !sampleText.trim()}
            className="neu-btn-primary px-5 py-2.5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isLoading ? "Simulating..." : "Test Rules"}</span>
          </button>
        </div>
      </form>

      {result && (
        <div className="pt-3 border-t border-slate-200/60 space-y-3">
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
              <div className="p-3 rounded-2xl neu-pressed text-blue-900 flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  Stage Move: <strong>NEW → {result.stageUpdated}</strong>
                </span>
              </div>
            )}

            {result.tagsAdded.length > 0 && (
              <div className="p-3 rounded-2xl neu-pressed text-amber-900 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Tags: <strong>{result.tagsAdded.join(", ")}</strong></span>
              </div>
            )}

            {result.assignedAgentName && (
              <div className="p-3 rounded-2xl neu-pressed text-purple-900 flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Routing: <strong>{result.assignedAgentName}</strong></span>
              </div>
            )}

            {result.autoReplied && result.autoReplyText && (
              <div className="col-span-full p-3 rounded-2xl neu-pressed text-emerald-900 flex items-start gap-2">
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
