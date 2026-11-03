"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, ToastType } from "@/store/useToastStore";

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES: Record<
  ToastType,
  {
    bg: string;
    border: string;
    iconColor: string;
    titleColor: string;
    descColor: string;
    accent: string;
  }
> = {
  success: {
    bg: "neu-card bg-white shadow-xl",
    border: "border-emerald-500/40",
    iconColor: "text-emerald-600",
    titleColor: "text-slate-900",
    descColor: "text-slate-600",
    accent: "bg-[#16a34a]",
  },
  error: {
    bg: "neu-card bg-white shadow-xl",
    border: "border-rose-500/40",
    iconColor: "text-rose-600",
    titleColor: "text-slate-900",
    descColor: "text-slate-600",
    accent: "bg-rose-500",
  },
  info: {
    bg: "neu-card bg-white shadow-xl",
    border: "border-[#ff6422]/40",
    iconColor: "text-[#ea5414]",
    titleColor: "text-slate-900",
    descColor: "text-slate-600",
    accent: "bg-[#ff6422]",
  },
  warning: {
    bg: "neu-card bg-white shadow-xl",
    border: "border-amber-500/40",
    iconColor: "text-amber-600",
    titleColor: "text-slate-900",
    descColor: "text-slate-600",
    accent: "bg-amber-500",
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        const style = STYLES[t.type] || STYLES.info;

        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-3.5 sm:p-4 animate-in slide-in-from-top-3 sm:slide-in-from-right-5 fade-in duration-200 transition-all`}
          >
            {/* Top Accent Strip */}
            <div className={`absolute top-0 inset-x-0 h-1 ${style.accent}`} />

            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-xl neu-pressed ${style.iconColor} shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <h4 className={`text-xs font-bold ${style.titleColor} leading-tight`}>
                  {t.title}
                </h4>
                {t.description && (
                  <p className={`text-[11px] ${style.descColor} mt-0.5 leading-relaxed`}>
                    {t.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                className="text-slate-500 hover:text-slate-900 p-1 rounded-lg neu-btn transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
