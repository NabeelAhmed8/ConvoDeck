"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRIES, Country, DEFAULT_COUNTRY } from "@/lib/countries";
import { CountryOptionItem } from "./CountryOptionItem";

interface CountryCodeDropdownProps {
  selectedDialCode: string;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

/**
 * CountryCodeDropdown
 * Single Responsibility: Compact, responsive country dialing code dropdown
 * placed directly under the input field with isolated scroll mechanics to
 * completely prevent background page scrolling.
 */
export function CountryCodeDropdown({
  selectedDialCode,
  onSelect,
  disabled = false,
}: CountryCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const touchStartY = useRef<number>(0);

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

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
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

  /**
   * Scroll Isolation for Desktop Mouse Wheels
   * Prevents mouse wheel scrolling from bubbling and scrolling the background page.
   */
  const handleListWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isScrollingUp = e.deltaY < 0;
    const isScrollingDown = e.deltaY > 0;

    if (
      (isScrollingUp && el.scrollTop <= 0) ||
      (isScrollingDown && el.scrollTop + el.clientHeight >= el.scrollHeight - 1)
    ) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  /**
   * Scroll Isolation for Mobile Touch Devices
   * Prevents touch drag from moving the background page when scrolling through country codes.
   */
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const currentY = e.touches[0].clientY;
    const isPullingDown = currentY > touchStartY.current;
    const isPushingUp = currentY < touchStartY.current;

    if (
      (isPullingDown && el.scrollTop <= 0) ||
      (isPushingUp && el.scrollTop + el.clientHeight >= el.scrollHeight - 1)
    ) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button: Attached cleanly to input */}
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

      {/* Compact Popover Dropdown Menu right under the input */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Country Dialing Codes"
          className="absolute z-50 left-0 top-full mt-1.5 w-64 max-w-[calc(100vw-2.5rem)] neu-card rounded-2xl p-2 bg-[#edf1f7] shadow-xl border border-white/80 animate-in fade-in zoom-in-95 duration-150 overscroll-contain select-none"
        >
          {/* Compact Search Box */}
          <div className="relative mb-1.5 px-0.5">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full pl-7 pr-2.5 py-1 text-xs neu-input rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
              aria-label="Search country or dial code"
            />
          </div>

          {/* Isolated Scrollable Options List */}
          <div
            ref={listRef}
            onWheel={handleListWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="max-h-48 overflow-y-auto space-y-0.5 pr-1 overscroll-contain touch-pan-y custom-scrollbar"
          >
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">
                No country found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredCountries.map((c) => (
                <CountryOptionItem
                  key={c.code}
                  country={c}
                  isSelected={c.code === selectedCountry.code}
                  onSelect={handleSelectCountry}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
