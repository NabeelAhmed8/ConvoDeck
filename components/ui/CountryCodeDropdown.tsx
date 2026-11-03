"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { COUNTRIES, Country, DEFAULT_COUNTRY } from "@/lib/countries";
import { CountryOptionItem } from "./CountryOptionItem";

interface CountryCodeDropdownProps {
  selectedDialCode: string;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

/**
 * CountryCodeDropdown
 * Single Responsibility: Dynamic, responsive country dialing code selector.
 * Renders an accessible Neumorphic popover on desktop and a smooth bottom-sheet
 * dialog on mobile devices to prevent any viewport clipping.
 */
export function CountryCodeDropdown({
  selectedDialCode,
  onSelect,
  disabled = false,
}: CountryCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

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

  // Close on outside click for desktop popover
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

  // Handle focus & body scroll lock on mobile when open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      // Lock body scroll on small screens
      const originalOverflow = document.body.style.overflow;
      if (window.innerWidth < 640) {
        document.body.style.overflow = "hidden";
      }

      const timer = setTimeout(() => {
        if (window.innerWidth >= 640) {
          desktopSearchInputRef.current?.focus();
        } else {
          mobileSearchInputRef.current?.focus();
        }
      }, 60);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
      };
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

      {/* 1. MOBILE RESPONSIVE BOTTOM SHEET (Viewport < 640px) */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select Country Code"
            className="relative z-10 w-full bg-[#edf1f7] neu-card rounded-t-3xl p-4 max-h-[82vh] flex flex-col shadow-2xl border-t border-white/80 animate-in slide-in-from-bottom duration-200"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-300/50 mb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Select Country Code
                </h3>
                <p className="text-[11px] text-slate-500">
                  Choose your international calling prefix
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close country selector"
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input on Mobile */}
            <div className="relative mb-3 shrink-0">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code (e.g. +92, US)..."
                className="w-full pl-9 pr-3 py-2.5 text-sm neu-input rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
                aria-label="Search country or dial code"
              />
            </div>

            {/* Countries Scrollable List on Mobile */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-0">
              {filteredCountries.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No country found matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredCountries.map((c) => (
                  <CountryOptionItem
                    key={`mobile-${c.code}`}
                    country={c}
                    isSelected={c.code === selectedCountry.code}
                    onSelect={handleSelectCountry}
                    isMobile={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DESKTOP POPOVER DROPDOWN (Viewport >= 640px) */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Country Dialing Codes"
          className="hidden sm:block absolute z-50 left-0 top-full mt-2 w-80 max-w-[calc(100vw-3rem)] neu-card rounded-2xl p-2 bg-[#edf1f7] shadow-xl border border-white/60 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Desktop Search Box */}
          <div className="relative mb-2 px-1">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={desktopSearchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full pl-8 pr-3 py-1.5 text-xs neu-input rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
              aria-label="Search country or dial code"
            />
          </div>

          {/* Desktop Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">
                No country found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredCountries.map((c) => (
                <CountryOptionItem
                  key={`desktop-${c.code}`}
                  country={c}
                  isSelected={c.code === selectedCountry.code}
                  onSelect={handleSelectCountry}
                  isMobile={false}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
