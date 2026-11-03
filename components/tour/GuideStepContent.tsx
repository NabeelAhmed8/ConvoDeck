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
    <div className="py-3.5 sm:py-5 space-y-3 sm:space-y-4">
      {/* Icon + Title + Subtitle */}
      <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl neu-convex flex items-center justify-center shrink-0 text-slate-900 shadow-sm mt-0.5 sm:mt-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
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
      <div className="space-y-1.5 sm:space-y-2 pt-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
          Key Capabilities:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {step.highlights.map((item, idx) => (
            <div
              key={idx}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl neu-pressed text-xs font-medium text-slate-700 flex items-center gap-2 bg-[#edf2f8] min-w-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6422] shrink-0" />
              <span className="text-[11px] sm:text-xs min-w-0 flex-1 leading-snug break-words sm:truncate">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Shortcut Action Link */}
      {step.shortcutHref && (
        <div className="pt-1 sm:pt-2">
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

