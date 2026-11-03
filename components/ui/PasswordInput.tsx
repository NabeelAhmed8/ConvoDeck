"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "./Button";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
}

/**
 * PasswordInput
 * Single Responsibility: Secure password input field with an interactive
 * show/hide toggle eye button, tactile Neumorphic styling, and full accessibility.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      name,
      value,
      onChange,
      placeholder = "••••••••",
      autoComplete = "current-password",
      required = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative w-full">
        {/* Left Lock Icon */}
        <Lock
          className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0"
          aria-hidden="true"
        />

        {/* Password Input */}
        <input
          ref={ref}
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-required={required}
          disabled={disabled}
          className={cn(
            "w-full pl-9 pr-10 py-2.5 text-base sm:text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />

        {/* Show / Hide Toggle Eye Button */}
        <button
          type="button"
          tabIndex={0}
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-slate-600" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4 text-slate-400" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

