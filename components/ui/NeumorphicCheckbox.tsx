"use client";

import React, { useId } from "react";
import { Check } from "lucide-react";

export interface NeumorphicCheckboxProps {
  id?: string;
  name?: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Single-responsibility Neumorphic tactile checkbox.
 * Features recessed dual-shadow well (neu-pressed) when unchecked,
 * vibrant tangerine gradient pop when checked, and full keyboard accessibility.
 */
export function NeumorphicCheckbox({
  id: customId,
  name = "rememberMe",
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}: NeumorphicCheckboxProps) {
  const autoId = useId();
  const checkboxId = customId || autoId;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group text-xs text-slate-600 hover:text-slate-900 transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {/* Hidden native input for form submissions & screen readers */}
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        aria-checked={checked}
      />

      {/* Tactile Neumorphic Checkbox Well */}
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6422]/40 ${
          checked
            ? "bg-gradient-to-br from-[#ff6a28] to-[#ea5414] text-white shadow-[0_2px_6px_rgba(255,100,34,0.38),inset_1px_1px_2px_rgba(255,255,255,0.4)] border border-[#ea5414]"
            : "bg-[#e9eff6] neu-pressed shadow-[inset_2px_2px_4px_#c4cedc,inset_-2px_-2px_4px_#ffffff] border border-slate-300/60 group-hover:border-slate-400/80"
        }`}
      >
        <Check
          className={`w-3 h-3 text-white stroke-[3] transition-all duration-150 transform ${
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Label Text */}
      <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
        {label}
      </span>
    </label>
  );
}

