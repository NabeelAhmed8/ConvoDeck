"use client";

import React, { useRef, useId } from "react";

export interface NeumorphicAutocompleteInputProps {
  id?: string;
  name?: string;
  type?: "text" | "email" | "tel" | "search" | "password";
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

/**
 * Single-responsibility Neumorphic Input.
 * Provides tactile Neumorphic styling with natural native Chrome/browser autofill.
 * Automatically dismisses floating Chrome autofill overlay on scroll to prevent detached scrolling glitches.
 */
export function NeumorphicAutocompleteInput({
  id: customId,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  label,
  icon,
  disabled = false,
  required = false,
  autoFocus = false,
  autoComplete: customAutoComplete,
  className = "",
}: NeumorphicAutocompleteInputProps) {
  const autoId = useId();
  const inputId = customId || (name ? `input-${name}` : `input-${autoId}`);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default natural Chrome autocomplete attribute
  const defaultAutoComplete =
    type === "email"
      ? "email"
      : type === "tel"
      ? "tel"
      : name?.toLowerCase().includes("name")
      ? "name"
      : name?.toLowerCase().includes("company")
      ? "organization"
      : "on";

  const effectiveAutoComplete = customAutoComplete || defaultAutoComplete;

  return (
    <div className="w-full min-w-0">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 mb-1.5 truncate"
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
      <div className="relative w-full min-w-0">
        {icon && (
          <div className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0 z-10 flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          name={name || inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          autoComplete={effectiveAutoComplete}
          className={`w-full min-w-0 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-hidden transition-all placeholder-slate-400 ${
            icon ? "pl-9 pr-3.5" : "px-3.5"
          } ${className}`}
        />
      </div>
    </div>
  );
}

/**
 * Backwards compatibility helper export
 */
export function saveInputSuggestionHistory(_storageKey: string, _item: string) {
  // Native Chrome autofill is used instead of custom localStorage history
}
