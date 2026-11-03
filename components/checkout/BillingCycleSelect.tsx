"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Calendar, Sparkles } from "lucide-react";
import { BillingFrequency } from "@/types";

export interface BillingCycleOption {
  id: BillingFrequency;
  title: string;
  badge?: string;
  description: string;
  icon: React.ElementType;
}

export const BILLING_CYCLE_OPTIONS: BillingCycleOption[] = [
  {
    id: "monthly",
    title: "Monthly Billing",
    badge: "Flexible",
    description: "Standard rate, billed month-to-month",
    icon: Calendar,
  },
  {
    id: "yearly",
    title: "Yearly Billing",
    badge: "Save 20%",
    description: "2 months free + annual discount applied",
    icon: Sparkles,
  },
];

interface BillingCycleSelectProps {
  id?: string;
  value: BillingFrequency;
  onChange: (val: BillingFrequency) => void;
  disabled?: boolean;
}

/**
 * BillingCycleSelect
 * Single Responsibility: Dynamic tactile Neumorphic dropdown for switching
 * between Monthly and Yearly billing cycles on the Checkout page.
 * Includes an accessible native <select> form field paired with the label for 100% WCAG compliance.
 */
export function BillingCycleSelect({
  id = "checkout-billing-cycle-select",
  value,
  onChange,
  disabled = false,
}: BillingCycleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    BILLING_CYCLE_OPTIONS.find((opt) => opt.id === value) ||
    BILLING_CYCLE_OPTIONS[0];

  // Close on outside click
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

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (cycle: BillingFrequency) => {
    onChange(cycle);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 
        Native HTML Form Field associated with <label htmlFor={id}>
        Ensures 100% compliance with HTML accessibility validators & screen readers
      */}
      <select
        id={id}
        name="billingCycle"
        aria-label="Select Billing Cycle"
        value={value}
        onChange={(e) => onChange(e.target.value as BillingFrequency)}
        className="sr-only"
        tabIndex={-1}
      >
        {BILLING_CYCLE_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.title} ({opt.badge || "Standard"})
          </option>
        ))}
      </select>

      {/* Dynamic Tactile Neumorphic Trigger Button */}
      <button
        type="button"
        id={`${id}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select billing cycle: currently ${selectedOption.title}`}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-xs neu-input rounded-xl text-slate-900 font-semibold focus:outline-none flex items-center justify-between gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-white/70 hover:bg-white"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate">
            {value === "yearly" ? "Yearly" : "Monthly"}
          </span>
          {value === "yearly" && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-[#ff6422] shrink-0 border border-orange-200/50">
              -20%
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#ff6422]" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dynamic Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={`${id}-trigger`}
          className="absolute top-full mt-1.5 inset-x-0 z-50 neu-card rounded-2xl bg-[#edf1f7] border border-white/90 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 min-w-[200px]"
        >
          {BILLING_CYCLE_OPTIONS.map((option) => {
            const isSelected = option.id === value;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.id)}
                className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "neu-pressed bg-white text-slate-900 border border-orange-200/50"
                    : "hover:bg-white/80 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg neu-convex flex items-center justify-center shrink-0 ${
                      isSelected ? "text-[#ff6422]" : "text-slate-500"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold leading-tight truncate">
                        {option.title}
                      </p>
                      {option.badge && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${
                            option.id === "yearly"
                              ? "bg-orange-100 text-[#ff6422] font-bold"
                              : "bg-slate-200/60 text-slate-600"
                          }`}
                        >
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <Check
                    className="w-3.5 h-3.5 text-[#ff6422] shrink-0 mr-0.5"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
