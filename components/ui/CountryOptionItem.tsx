"use client";

import React from "react";
import { Check } from "lucide-react";
import { Country } from "@/lib/countries";

interface CountryOptionItemProps {
  country: Country;
  isSelected: boolean;
  onSelect: (country: Country) => void;
  isMobile?: boolean;
}

/**
 * CountryOptionItem
 * Single Responsibility: Renders a single country option row with flag,
 * country name, international dial code, and active selection checkmark.
 */
export function CountryOptionItem({
  country,
  isSelected,
  onSelect,
  isMobile = false,
}: CountryOptionItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(country)}
      className={`w-full flex items-center justify-between rounded-xl text-left transition-all cursor-pointer select-none ${
        isMobile ? "px-3.5 py-3 text-sm" : "px-2.5 py-1.5 text-xs"
      } ${
        isSelected
          ? "bg-orange-50 text-[#ea5414] font-semibold neu-pressed border border-orange-200/60"
          : "text-slate-700 hover:bg-slate-200/70 active:bg-slate-300/60"
      }`}
    >
      {/* Left Flag & Name */}
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <span
          className={`shrink-0 leading-none ${isMobile ? "text-xl" : "text-base"}`}
          aria-hidden="true"
        >
          {country.flag}
        </span>
        <span className="truncate font-medium text-slate-800">
          {country.name}
        </span>
      </div>

      {/* Right Dial Code & Checkmark */}
      <div className="flex items-center gap-2 shrink-0 pl-1">
        <span
          className={`font-mono text-slate-500 font-normal ${
            isMobile ? "text-xs" : "text-[11px]"
          }`}
        >
          {country.dialCode}
        </span>
        {isSelected && (
          <Check
            className={`text-[#ff6422] shrink-0 ${
              isMobile ? "w-4 h-4" : "w-3.5 h-3.5"
            }`}
            aria-hidden="true"
          />
        )}
      </div>
    </button>
  );
}

