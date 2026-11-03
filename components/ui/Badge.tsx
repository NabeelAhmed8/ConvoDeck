import React from "react";
import { cn } from "./Button";
import { LeadStage } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "neu-pressed text-slate-700 border-slate-300/40",
    success: "bg-emerald-100 text-emerald-800 border-emerald-300/70",
    warning: "bg-amber-100 text-amber-800 border-amber-300/70",
    danger: "bg-rose-100 text-rose-800 border-rose-300/70",
    info: "bg-[#ff6422]/10 text-[#ea5414] border-[#ff6422]/30",
    purple: "bg-purple-100 text-purple-800 border-purple-300/70",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StageBadge({ stage }: { stage: LeadStage }) {
  const config: Record<
    LeadStage,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    NEW: { label: "New Inquiry", variant: "info" },
    CONTACTED: { label: "Contacted", variant: "purple" },
    DEMO_SCHEDULED: { label: "Demo Scheduled", variant: "warning" },
    PROPOSAL_SENT: { label: "Proposal Sent", variant: "default" },
    WON: { label: "Deal Won", variant: "success" },
    LOST: { label: "Lost", variant: "danger" },
  };

  const item = config[stage] || { label: stage, variant: "default" };

  return <Badge variant={item.variant}>{item.label}</Badge>;
}
