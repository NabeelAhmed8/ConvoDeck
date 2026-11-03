"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRIES, Country, DEFAULT_COUNTRY } from "@/lib/countries";

interface CountryCodeDropdownProps {
  selectedDialCode: string;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

/**
 * CountryCodeDropdown
 * Single Responsibility: Interactive dynamic Neumorphic dropdown for selecting
 * an international country dialing code with live real-time search filtering.
 */
export function CountryCodeDropdown({
  selectedDialCode,
  onSelect,
  disabled = false,
}: CountryCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active selected country
  const selectedCountry = useMemo(() => {
    return (
      COUNTRIES.find((c) => c.dialCode === selectedDialCode) ||
      COUNTRIES.find((c) => selectedDialCode.startsWith(c.dialCode)) ||
      DEFAULT_COUNTRY
    );
  }, [selectedDialCode]);

  // Filter countries dynamically based on user search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelectCountry = (country: Country) => {
    onSelect(country);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select Country Code. Currently selected: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        className="h-full flex items-center gap-1.5 px-3 py-2.5 rounded-l-2xl neu-pressed bg-[#edf2f8] text-slate-800 text-xs font-semibold hover:text-slate-950 focus:outline-none transition-colors cursor-pointer border-r border-slate-300/60 disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {selectedCountry.flag}
        </span>
        <span className="font-mono text-xs text-slate-700">
          {selectedCountry.dialCode}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#ff6422]" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dynamic Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Country Dialing Codes"
          className="absolute z-50 left-0 top-full mt-2 w-72 max-w-[90vw] neu-card rounded-2xl p-2 bg-[#edf1f7] shadow-xl border border-white/60 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search Box */}
          <div className="relative mb-2 px-1">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full pl-8 pr-3 py-1.5 text-xs neu-input rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
              aria-label="Search country or dial code"
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">
                No country found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-orange-50 text-[#ea5414] font-semibold neu-pressed"
                        : "text-slate-700 hover:bg-slate-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0 leading-none" aria-hidden="true">
                        {c.flag}
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="font-mono text-[11px] text-slate-500">
                        {c.dialCode}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#ff6422]" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

