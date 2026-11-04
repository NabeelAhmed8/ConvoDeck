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
 * Features a perfectly anchored invisible native input to eliminate scroll jumps,
 * tactile recessed well (neu-pressed) when unchecked, vibrant tangerine gradient when checked,
 * and robust keyboard accessibility.
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

  return (
    <div
      className={`relative inline-flex items-center gap-2.5 select-none group text-xs text-slate-600 hover:text-slate-900 transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      {/* Visual Tactile Checkbox Box */}
      <div
        className={`relative w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${
          checked
            ? "bg-gradient-to-br from-[#ff6a28] to-[#ea5414] text-white shadow-[0_2px_6px_rgba(255,100,34,0.38),inset_1px_1px_2px_rgba(255,255,255,0.4)] border border-[#ea5414]"
            : "bg-[#e9eff6] neu-pressed shadow-[inset_2px_2px_4px_#c4cedc,inset_-2px_-2px_4px_#ffffff] border border-slate-300/60 group-hover:border-slate-400/80"
        }`}
      >
        {/* Real native checkbox anchored exactly over the box — zero scroll jump, zero displacement */}
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.checked);
          }}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 m-0 p-0"
          aria-checked={checked}
        />

        {/* Tactile Checkmark */}
        <Check
          className={`w-3 h-3 text-white stroke-[3] transition-all duration-150 transform pointer-events-none ${
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Label Text */}
      <label
        htmlFor={checkboxId}
        className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
}
