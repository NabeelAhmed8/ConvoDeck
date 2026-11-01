import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all rounded-full focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary:
        "neu-btn-primary text-white font-semibold border-none",
      secondary:
        "neu-tab text-slate-700 font-medium",
      outline:
        "neu-btn text-slate-700 hover:text-slate-900 font-semibold border border-slate-200/60",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/30 rounded-full",
      ghost:
        "bg-transparent hover:neu-flat text-slate-700 hover:text-slate-900",
      whatsapp:
        "neu-btn-emerald text-white font-bold border-none",
    };

    const sizes = {
      sm: "px-2.5 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
