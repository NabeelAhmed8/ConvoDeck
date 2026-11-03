"use client";

import React from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AgentCreationSuccessViewProps {
  agentName: string;
  agentEmail: string;
  agentRole: string;
  previewUrl?: string | null;
  onDone: () => void;
}

/**
 * AgentCreationSuccessView
 * Single-responsibility component displaying a compact, scroll-free confirmation
 * view once an agent is created, featuring the 'Done' action button.
 */
export function AgentCreationSuccessView({
  agentName,
  agentEmail,
  agentRole,
  previewUrl,
  onDone,
}: AgentCreationSuccessViewProps) {
  const roleLabel =
    agentRole === "manager"
      ? "Team Manager"
      : agentRole === "admin"
      ? "Administrator"
      : "Sales Agent";

  return (
    <div className="flex flex-col items-center text-center py-2 space-y-4 animate-in zoom-in-95 duration-150">
      {/* Success Icon */}
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 neu-convex flex items-center justify-center border border-emerald-200/60 shadow-xs">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      {/* Title & Subtitle */}
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-black text-slate-900 tracking-tight">
          Agent Account Created!
        </h4>
        <p className="text-xs text-slate-500">
          Login credentials have been generated and dispatched to{" "}
          <span className="font-semibold text-slate-800">{agentEmail}</span>.
        </p>
      </div>

      {/* Compact Agent Details Pill */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-pressed bg-[#edf2f8] text-xs">
        <span className="font-bold text-slate-900">{agentName}</span>
        <span className="text-slate-400">•</span>
        <span className="text-[11px] font-semibold text-[#ea5414] uppercase tracking-wider">
          {roleLabel}
        </span>
      </div>

      {/* Dispatched Email Preview Link (if available) */}
      {previewUrl && (
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[#ea5414] hover:text-[#ff6422] underline font-semibold inline-flex items-center gap-1 transition-colors"
        >
          View Dispatched Email Preview <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {/* Primary Action Button (Directly visible, ZERO scrolling needed) */}
      <div className="pt-2 w-full flex justify-center">
        <Button
          type="button"
          onClick={onDone}
          className="neu-btn-primary cursor-pointer border-none px-10 py-2.5 text-xs font-bold shadow-md hover:scale-102 transition-transform w-full sm:w-auto"
        >
          Done
        </Button>
      </div>
    </div>
  );
}

