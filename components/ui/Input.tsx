import React, { useId } from "react";
import { cn } from "./Button";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, name, required, ...props }, ref) => {
    const generatedId = useId();
    const finalId = id || (name ? `input-${name}` : `input-${generatedId}`);
    const finalName = name || finalId;
    const errorId = error ? `${finalId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={finalId}
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          id={finalId}
          name={finalName}
          ref={ref}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={errorId}
          aria-label={props["aria-label"] || (typeof label === "string" ? label : undefined)}
          className={cn(
            "w-full px-3.5 py-2.5 text-base sm:text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors",
            error && "border-rose-500/50 focus:ring-rose-500/50",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-rose-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
