"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Users,
  Settings,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { IGuideStep } from "./guideStepsData";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Users,
  Settings,
  CreditCard,
};

interface GuideStepContentProps {
  step: IGuideStep;
  onNavigate?: () => void;
}

/**
 * GuideStepContent
 * Single-responsibility component for rendering the active feature's
 * icon, title, description, and tactile benefit pills.
 */
export function GuideStepContent({ step, onNavigate }: GuideStepContentProps) {
  const Icon = ICONS[step.iconName] || Sparkles;

  return (
    <div className="py-5 space-y-4">
      {/* Icon + Title + Subtitle */}
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center shrink-0 text-slate-900 shadow-sm">
          <Icon className="w-6 h-6 text-slate-900" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            {step.title}
          </h3>
          <p className="text-xs font-semibold text-[#ea5414] mt-0.5">
            {step.subtitle}
          </p>
        </div>
      </div>

      {/* Narrative Description */}
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        {step.description}
      </p>

      {/* Feature Highlight Pills */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
          Key Capabilities:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {step.highlights.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-2xl neu-pressed text-xs font-medium text-slate-700 flex items-center gap-2 bg-[#edf2f8]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6422] shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shortcut Action Link */}
      {step.shortcutHref && (
        <div className="pt-2">
          <Link
            href={step.shortcutHref}
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ea5414] hover:text-[#c2410c] transition-colors group cursor-pointer"
          >
            <span>{step.shortcutLabel || "Go to this section"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}

