"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Command } from "lucide-react";
import { SEARCH_ITEMS, SearchItem } from "./searchData";
import { SearchResultsDropdown } from "./SearchResultsDropdown";

interface NavbarQuickSearchProps {
  onItemNavigated?: () => void;
  isMobileFullWidth?: boolean;
}

export function NavbarQuickSearch({
  onItemNavigated,
  isMobileFullWidth = false,
}: NavbarQuickSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        if (e.key === "Escape") {
          setIsOpen(false);
          inputRef.current?.blur();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter items based on query
  const filteredResults = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      // Return top 5 featured items when empty
      return SEARCH_ITEMS.slice(0, 5);
    }
    return SEARCH_ITEMS.filter((item) => {
      return (
        item.title.toLowerCase().includes(clean) ||
        item.description.toLowerCase().includes(clean) ||
        item.category.toLowerCase().includes(clean) ||
        item.keywords.some((k) => k.toLowerCase().includes(clean))
      );
    });
  }, [query]);

  const handleSelectItem = (item: SearchItem) => {
    setIsOpen(false);
    setQuery("");
    onItemNavigated?.();

    if (item.href.startsWith("#")) {
      const el = document.querySelector(item.href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = item.href;
      }
    } else {
      router.push(item.href);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${
        isMobileFullWidth
          ? "w-full"
          : "hidden md:flex items-center"
      }`}
    >
      {/* Search Input Box */}
      <div
        className={`flex items-center relative neu-pressed px-3.5 py-1.5 rounded-full text-xs text-slate-500 transition-all ${
          isMobileFullWidth
            ? "w-full bg-[#e9eff6]"
            : "w-40 lg:w-48 xl:w-56 focus-within:w-60 xl:focus-within:w-64"
        }`}
      >
        <label htmlFor={isMobileFullWidth ? "mobile-quick-search" : "landing-quick-search"} className="sr-only">
          Search ConvoDeck features and tools
        </label>
        <Search
          className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0 pointer-events-none"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          id={isMobileFullWidth ? "mobile-quick-search" : "landing-quick-search"}
          name="quickSearch"
          type="search"
          autoComplete="off"
          aria-label="Search ConvoDeck features and tools"
          placeholder="Search features..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          !isMobileFullWidth && (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white/70 rounded-md border border-slate-300/50 shadow-2xs pointer-events-none">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          )
        )}
      </div>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2.5 neu-card rounded-3xl bg-[#edf1f7] border border-white/90 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isMobileFullWidth
              ? "left-0 right-0 w-full"
              : "right-0 w-80 lg:w-96"
          }`}
        >
          <SearchResultsDropdown
            results={filteredResults}
            onSelect={handleSelectItem}
          />
        </div>
      )}
    </div>
  );
}

