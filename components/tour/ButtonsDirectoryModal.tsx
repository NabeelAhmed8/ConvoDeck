"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Compass,
  ChevronLeft,
  PlusCircle,
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Users,
  CreditCard,
  Settings,
  Phone,
  LogOut,
  Send,
  PanelRightOpen,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Move,
  UserPlus,
  ToggleLeft,
  Shield,
  Save,
  Copy,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { BUTTONS_DIRECTORY, IButtonGuideItem } from "@/constants/buttonsDirectory";

const DIRECTORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ChevronLeft,
  PlusCircle,
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Users,
  CreditCard,
  Settings,
  Phone,
  Compass,
  LogOut,
  Send,
  PanelRightOpen,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Move,
  UserPlus,
  ToggleLeft,
  Shield,
  Save,
  Copy,
  RefreshCw,
  Sparkles,
};

const CATEGORIES = [
  "All",
  "Navigation",
  "Inbox & Chat",
  "Pipeline & CRM",
  "Team & Security",
  "Settings & Billing",
] as const;

interface ButtonsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStepTour: () => void;
}

export function ButtonsDirectoryModal({
  isOpen,
  onClose,
  onStartStepTour,
}: ButtonsDirectoryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredButtons = useMemo(() => {
    return BUTTONS_DIRECTORY.filter((btn) => {
      const matchesCategory =
        selectedCategory === "All" || btn.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        btn.name.toLowerCase().includes(q) ||
        btn.description.toLowerCase().includes(q) ||
        btn.location.toLowerCase().includes(q) ||
        btn.actionDetails.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="buttons-directory-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm pointer-events-auto animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6422]/10 text-[#ea5414] flex items-center justify-center shrink-0 border border-[#ff6422]/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 id="buttons-directory-title" className="text-base sm:text-lg font-bold text-slate-900">
                Website Buttons & Controls Guide
              </h2>
              <p className="text-xs text-slate-500">
                Complete reference of all essential buttons, locations, and actions across ConvoDeck.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onStartStepTour}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl neu-btn-primary text-white transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start Interactive Tour
            </button>
            <button
              onClick={onClose}
              aria-label="Close Guide"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any button by name, location, or feature (e.g. Add Lead, Webhook, Collapse)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff6422] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {filteredButtons.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No buttons found matching &ldquo;{searchQuery}&rdquo;. Try a different search term.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredButtons.map((btn) => {
                const Icon = DIRECTORY_ICONS[btn.iconName] || Sparkles;
                return (
                  <div
                    key={btn.id}
                    className="p-3.5 rounded-2xl border border-slate-150 hover:border-[#ff6422]/40 hover:shadow-xs transition-all bg-white flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#ff6422]/10 text-[#ea5414] flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-xs text-slate-900">{btn.name}</span>
                        </div>
                        {btn.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {btn.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1.5 font-medium">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                          📍 {btn.location}
                        </span>
                        {btn.shortcut && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200/50 px-1.5 py-0.5 rounded font-mono">
                            ⌨️ {btn.shortcut}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-1">
                        {btn.description}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <strong className="text-slate-700">Action:</strong> {btn.actionDetails}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredButtons.length} important website buttons</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
