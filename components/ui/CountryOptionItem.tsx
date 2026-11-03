"use client";

import React from "react";
import { Check } from "lucide-react";
import { Country } from "@/lib/countries";

interface CountryOptionItemProps {
  country: Country;
  isSelected: boolean;
  onSelect: (country: Country) => void;
}

/**
 * CountryOptionItem
 * Single Responsibility: Renders a single compact country option row with flag,
 * country name, international dial code, and active selection checkmark.
 */
export function CountryOptionItem({
  country,
  isSelected,
  onSelect,
}: CountryOptionItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(country)}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-all cursor-pointer select-none ${
        isSelected
          ? "bg-orange-50 text-[#ea5414] font-semibold neu-pressed border border-orange-200/50"
          : "text-slate-700 hover:bg-slate-200/60 active:bg-slate-300/50"
      }`}
    >
      {/* Left: Flag & Name */}
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <span className="text-base shrink-0 leading-none" aria-hidden="true">
          {country.flag}
        </span>
        <span className="truncate text-slate-800 text-xs">
          {country.name}
        </span>
      </div>

      {/* Right: Dial Code & Checkmark */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1">
        <span className="font-mono text-[11px] text-slate-500">
          {country.dialCode}
        </span>
        {isSelected && (
          <Check className="w-3.5 h-3.5 text-[#ff6422] shrink-0" aria-hidden="true" />
        )}
      </div>
    </button>
  );
}
