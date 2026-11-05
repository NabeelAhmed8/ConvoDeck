"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { Check, Sparkles, Clock } from "lucide-react";

export interface NeumorphicAutocompleteInputProps {
  id?: string;
  name?: string;
  type?: "text" | "email" | "tel" | "search";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  suggestions?: string[];
  storageKey?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  className?: string;
}

const COMMON_EMAIL_DOMAINS = [
  "@gmail.com",
  "@outlook.com",
  "@yahoo.com",
  "@icloud.com",
  "@hotmail.com",
];

/**
 * Single-responsibility Neumorphic Autocomplete Input.
 * Replaces ugly browser/Chrome native autofill with a tactile Neumorphic suggestion popup.
 * Perfectly anchored to eliminate floating scroll detachment bugs and blocks Chrome native overlay.
 */
export function NeumorphicAutocompleteInput({
  id: customId,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  label,
  suggestions: customSuggestions = [],
  storageKey,
  icon,
  disabled = false,
  required = false,
  autoFocus = false,
  autoComplete: customAutoComplete,
  className = "",
}: NeumorphicAutocompleteInputProps) {
  const autoId = useId();
  const inputId = customId || autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [historyItems, setHistoryItems] = useState<string[]>([]);

  // Load remembered suggestions from localStorage if storageKey provided
  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`convodeck_suggest_${storageKey}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setHistoryItems(parsed.filter((item): item is string => typeof item === "string"));
          }
        }
      } catch {
        // Safe fallback if storage quota exceeded or disabled
      }
    }
  }, [storageKey]);

  // Compute dynamic suggestions list based on user input
  const getComputedSuggestions = (): { text: string; isHistory?: boolean }[] => {
    const query = (value || "").trim().toLowerCase();

    if (!query) {
      const combined = [
        ...historyItems.map((text) => ({ text, isHistory: true })),
        ...customSuggestions.map((text) => ({ text })),
      ];
      const seen = new Set<string>();
      const result: { text: string; isHistory?: boolean }[] = [];
      for (const item of combined) {
        if (!seen.has(item.text.toLowerCase())) {
          seen.add(item.text.toLowerCase());
          result.push(item);
        }
      }
      return result.slice(0, 5);
    }

    if (type === "email") {
      if (query.includes("@")) {
        const [username, domainPart] = query.split("@");
        if (!username) return [];
        return COMMON_EMAIL_DOMAINS
          .filter((d) => d.startsWith(`@${domainPart}`))
          .map((d) => ({ text: `${username}${d}` }));
      }
      // User hasn't typed '@' yet: suggest domains + history matches
      const domainMatches = COMMON_EMAIL_DOMAINS.map((d) => ({
        text: `${query}${d}`,
      }));
      const historyMatches = historyItems
        .filter((item) => item.toLowerCase().includes(query))
        .map((text) => ({ text, isHistory: true }));

      const seen = new Set<string>();
      const combined: { text: string; isHistory?: boolean }[] = [];
      for (const item of [...historyMatches, ...domainMatches]) {
        if (!seen.has(item.text.toLowerCase())) {
          seen.add(item.text.toLowerCase());
          combined.push(item);
        }
      }
      return combined.slice(0, 5);
    }

    // Text / tel / search type: filter custom & history
    const historyMatches = historyItems
      .filter((item) => item.toLowerCase().includes(query))
      .map((text) => ({ text, isHistory: true }));

    const customMatches = customSuggestions
      .filter((item) => item.toLowerCase().includes(query))
      .map((text) => ({ text }));

    const seen = new Set<string>();
    const combined: { text: string; isHistory?: boolean }[] = [];
    for (const item of [...historyMatches, ...customMatches]) {
      if (!seen.has(item.text.toLowerCase())) {
        seen.add(item.text.toLowerCase());
        combined.push(item);
      }
    }
    return combined.slice(0, 5);
  };

  const computedSuggestions = getComputedSuggestions();

  // Close popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Close popup gracefully on scroll so it never detaches or floats awkwardly
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const saveToHistory = (item: string) => {
    if (storageKey && item && typeof window !== "undefined") {
      try {
        const next = Array.from(new Set([item, ...historyItems])).slice(0, 10);
        setHistoryItems(next);
        localStorage.setItem(`convodeck_suggest_${storageKey}`, JSON.stringify(next));
      } catch {
        // Safe fallback
      }
    }
  };

  const handleSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
    saveToHistory(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || computedSuggestions.length === 0) {
      if (e.key === "ArrowDown" && computedSuggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % computedSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? computedSuggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(computedSuggestions[highlightedIndex].text);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      containerRef.current &&
      containerRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }
    const clean = (value || "").trim();
    if (clean && clean.length > 2) {
      saveToHistory(clean);
    }
  };

  // Chrome suppression mechanism:
  // 1. type="text" prevents Chrome's Email/Address C++ heuristic from popping up
  // 2. inputMode gives mobile keyboards the correct layout (@ for email, numbers for tel)
  // 3. autoComplete="new-password" or "off" with data-form-type="other" blocks Chrome and password managers
  const effectiveType = type === "email" ? "text" : type;
  const effectiveInputMode =
    type === "email" ? "email" : type === "tel" ? "tel" : undefined;
  const effectiveAutoComplete = customAutoComplete || "new-password";

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          {label}
          {required && (
            <span className="text-rose-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Input Field Container */}
      <div className="relative w-full">
        {icon && (
          <div className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0 z-10 flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          name={`cd_field_${name || inputId}`}
          type={effectiveType}
          inputMode={effectiveInputMode}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (computedSuggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          autoComplete={effectiveAutoComplete}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          aria-autocomplete="list"
          className={`w-full py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-hidden transition-all placeholder-slate-400 ${
            icon ? "pl-9 pr-3.5" : "px-3.5"
          } ${className}`}
        />

        {/* Dynamic Tactile Neumorphic Suggestion Popup - Anchored directly to input wrapper */}
        {isOpen && computedSuggestions.length > 0 && !disabled && (
          <div
            role="listbox"
            aria-label="Suggestions"
            className="absolute z-50 top-full left-0 right-0 mt-1.5 p-1.5 neu-card rounded-2xl bg-[#edf1f7] text-slate-900 shadow-xl border border-white/80 animate-in fade-in zoom-in-95 duration-100 max-h-52 overflow-y-auto chat-scrollbar"
          >
            <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200/60 pb-1 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#ff6422]" />
                Smart Suggestions
              </span>
              <span className="text-[9px] font-semibold text-slate-400">Esc to close</span>
            </div>

            <div className="space-y-0.5">
              {computedSuggestions.map((item, index) => {
                const isHighlighted = index === highlightedIndex;
                const isExactMatch =
                  item.text.toLowerCase() === (value || "").toLowerCase();

                return (
                  <button
                    key={`${item.text}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(item.text)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isHighlighted
                        ? "neu-pressed bg-[#e4eaf2] text-[#ff6422] font-bold"
                        : "hover:bg-slate-200/50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.isHistory && (
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{item.text}</span>
                    </div>
                    {isExactMatch && (
                      <Check className="w-3.5 h-3.5 text-[#ff6422] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Helper utility to explicitly save a confirmed value into the local suggestion history
 * (e.g. on form submission or successful credential verification).
 */
export function saveInputSuggestionHistory(storageKey: string, item: string) {
  if (!storageKey || !item || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(`convodeck_suggest_${storageKey}`);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const next = Array.from(new Set([item.trim(), ...existing])).slice(0, 10);
    localStorage.setItem(`convodeck_suggest_${storageKey}`, JSON.stringify(next));
  } catch {
    // Safe fallback
  }
}
