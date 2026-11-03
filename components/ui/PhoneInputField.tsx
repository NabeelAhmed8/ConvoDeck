"use client";

import React, { useId } from "react";
import { Phone } from "lucide-react";
import { CountryCodeDropdown } from "./CountryCodeDropdown";
import { Country, DEFAULT_COUNTRY } from "@/lib/countries";

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
}

/**
 * PhoneInputField
 * Single Responsibility: Unified phone input component combining a dynamic
 * country code selector with an accessible phone number input field.
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
  autoComplete = "tel-national",
  className = "",
}: PhoneInputFieldProps) {
  const generatedId = useId();
  const inputId = id || `phone-input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;

  const handleCountrySelect = (country: Country) => {
    onDialCodeChange(country.dialCode);
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep numbers and spaces, removing invalid symbols
    const cleaned = e.target.value.replace(/[^\d\s-]/g, "");
    onPhoneNumberChange(cleaned);
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
      <div className="relative flex items-stretch neu-input rounded-2xl overflow-visible focus-within:ring-2 focus-within:ring-[#ff6422]/20 transition-all">
        {/* Dynamic Country Code Dropdown Trigger & Popover */}
        <CountryCodeDropdown
          selectedDialCode={dialCode || DEFAULT_COUNTRY.dialCode}
          onSelect={handleCountrySelect}
          disabled={disabled}
        />

        {/* Phone Input with Right Phone Icon */}
        <div className="relative flex-1 min-w-0">
          <input
            id={inputId}
            name={name}
            type="tel"
            inputMode="numeric"
            autoComplete={autoComplete}
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={errorId}
            disabled={disabled}
            value={phoneNumber}
            onChange={handlePhoneInputChange}
            placeholder={placeholder}
            className="w-full h-full pl-3 pr-9 py-2.5 bg-transparent text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-mono disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Phone
            className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0"
            aria-hidden="true"
          />
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

