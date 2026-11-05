"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { Phone, Sparkles, Clock, Check } from "lucide-react";
import { CountryCodeDropdown } from "./CountryCodeDropdown";
import { Country, DEFAULT_COUNTRY } from "@/lib/countries";
import { saveInputSuggestionHistory } from "./NeumorphicAutocompleteInput";

export interface PhoneInputFieldProps {
  id?: string;
  name?: string;
  label?: string;
  dialCode: string;
  phoneNumber: string;
  onDialCodeChange: (dialCode: string) => void;
  onPhoneNumberChange: (phoneNumber: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
  className?: string;
  storageKey?: string;
  suggestions?: string[];
}

const DEFAULT_PHONE_SUGGESTIONS = [
  "300 1234567",
  "321 9876543",
  "333 4567890",
  "345 1122334",
];

/**
 * PhoneInputField
 * Single Responsibility: Unified phone input component combining a dynamic
 * country code selector with an accessible phone number input field equipped
 * with tactile Neumorphic smart suggestions and Chrome autofill suppression.
 */
export function PhoneInputField({
  id,
  name = "phoneNumber",
  label = "Phone / WhatsApp Number",
  dialCode,
  phoneNumber,
  onDialCodeChange,
  onPhoneNumberChange,
  placeholder = "300 1234567",
  required = false,
  disabled = false,
  error,
  autoComplete = "new-password",
  className = "",
  storageKey = "profile_phone_numbers",
  suggestions: customSuggestions = DEFAULT_PHONE_SUGGESTIONS,
}: PhoneInputFieldProps) {
  const generatedId = useId();
  const inputId = id || `phone-input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [historyItems, setHistoryItems] = useState<string[]>([]);

  // Load remembered suggestions from localStorage
  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`convodeck_suggest_${storageKey}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setHistoryItems(
              parsed.filter((item): item is string => typeof item === "string")
            );
          }
        }
      } catch {
        // Safe fallback
      }
    }
  }, [storageKey]);

  // Compute dynamic suggestions list
  const getComputedSuggestions = (): { text: string; isHistory?: boolean }[] => {
    const query = (phoneNumber || "").trim().toLowerCase();
    const effectiveSuggestions =
      customSuggestions.length > 0 ? customSuggestions : DEFAULT_PHONE_SUGGESTIONS;

    if (!query) {
      const combined = [
        ...historyItems.map((text) => ({ text, isHistory: true })),
        ...effectiveSuggestions.map((text) => ({ text })),
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

    const historyMatches = historyItems
      .filter((item) => item.toLowerCase().includes(query))
      .map((text) => ({ text, isHistory: true }));

    const customMatches = effectiveSuggestions
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

    if (combined.length <= 1) {
      for (const item of [
        ...historyItems.map((text) => ({ text, isHistory: true })),
        ...effectiveSuggestions.map((text) => ({ text })),
      ]) {
        if (!seen.has(item.text.toLowerCase())) {
          seen.add(item.text.toLowerCase());
          combined.push(item);
        }
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

  // Close popup gracefully on scroll
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

  const handleSelect = (item: string) => {
    const cleaned = item.replace(/[^\d\s-]/g, "");
    onPhoneNumberChange(cleaned);
    setIsOpen(false);
    if (storageKey) {
      saveInputSuggestionHistory(storageKey, cleaned);
    }
  };

  const handleCountrySelect = (country: Country) => {
    onDialCodeChange(country.dialCode);
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d\s-]/g, "");
    onPhoneNumberChange(cleaned);
    setIsOpen(true);
    setHighlightedIndex(-1);
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
    const clean = (phoneNumber || "").trim();
    if (clean && clean.length > 3 && storageKey) {
      saveInputSuggestionHistory(storageKey, clean);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          {label} {required && <span className="text-rose-500" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Combined Input Container */}
      <div
        ref={containerRef}
        className="relative flex items-stretch neu-input rounded-2xl overflow-visible focus-within:ring-2 focus-within:ring-[#ff6422]/20 transition-all"
      >
        {/* Dynamic Country Code Dropdown Trigger & Popover */}
        <CountryCodeDropdown
          id={`${inputId}-country`}
          name="countryCode"
          selectedDialCode={dialCode || DEFAULT_COUNTRY.dialCode}
          onSelect={handleCountrySelect}
          disabled={disabled}
        />

        {/* Phone Input with Right Phone Icon & Anchored Smart Suggestions */}
        <div className="relative flex-1 min-w-0">
          <input
            id={inputId}
            name={`cd_field_${name}`}
            type="tel"
            inputMode="numeric"
            autoComplete={autoComplete}
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            data-form-type="other"
            required={required}
            aria-required={required}
            aria-label={label}
            aria-invalid={!!error}
            aria-describedby={errorId}
            disabled={disabled}
            value={phoneNumber}
            onChange={handlePhoneInputChange}
            onFocus={() => {
              if (computedSuggestions.length > 0) {
                setIsOpen(true);
              }
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-full pl-3 pr-9 py-2.5 bg-transparent text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-mono disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Phone
            className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0"
            aria-hidden="true"
          />

          {/* Dynamic Tactile Neumorphic Suggestion Popup */}
          {isOpen && computedSuggestions.length > 0 && !disabled && (
            <div
              role="listbox"
              aria-label="Phone number suggestions"
              className="absolute z-50 top-full left-0 right-0 mt-2 p-1.5 neu-card rounded-2xl bg-[#edf1f7] text-slate-900 shadow-xl border border-white/80 animate-in fade-in zoom-in-95 duration-100 max-h-52 overflow-y-auto chat-scrollbar"
            >
              <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200/60 pb-1 mb-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#ff6422]" />
                  Smart Suggestions
                </span>
                <span className="text-[9px] font-semibold text-slate-400">
                  Esc to close
                </span>
              </div>

              <div className="space-y-0.5">
                {computedSuggestions.map((item, index) => {
                  const isHighlighted = index === highlightedIndex;
                  const isExactMatch =
                    item.text.replace(/\s+/g, "") ===
                    (phoneNumber || "").replace(/\s+/g, "");

                  return (
                    <button
                      key={`${item.text}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => handleSelect(item.text)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-mono transition-all cursor-pointer ${
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

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
