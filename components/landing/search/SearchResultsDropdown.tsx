"use client";

import React from "react";
import {
  MessageSquare,
  Kanban,
  CreditCard,
  Phone,
  LogIn,
  UserPlus,
  ShieldCheck,
  Headphones,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { SearchItem } from "./searchData";

const ICON_MAP = {
  MessageSquare,
  Kanban,
  CreditCard,
  Phone,
  LogIn,
  UserPlus,
  ShieldCheck,
  Headphones,
  FileText,
};

interface SearchResultsDropdownProps {
  results: SearchItem[];
  onSelect: (item: SearchItem) => void;
}

export function SearchResultsDropdown({
  results,
  onSelect,
}: SearchResultsDropdownProps) {
  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">No matching results</p>
        <p className="text-[11px] mt-0.5">Try searching for &quot;inbox&quot;, &quot;pricing&quot;, or &quot;pipeline&quot;.</p>
      </div>
    );
  }

  return (
    <div className="py-2 max-h-72 overflow-y-auto chat-scrollbar">
      <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600">
        <span>Suggested Features &amp; Actions</span>
        <span>{results.length} results</span>
      </div>

      <div className="space-y-1 px-1">
        {results.map((item) => {
          const Icon = ICON_MAP[item.iconName] || MessageSquare;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="w-full text-left p-2.5 rounded-2xl flex items-center justify-between gap-3 hover:bg-white transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl neu-convex text-slate-700 group-hover:text-[#ff6422] flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#ea5414] transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700 uppercase tracking-wider">
                  {item.category}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ff6422] transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

