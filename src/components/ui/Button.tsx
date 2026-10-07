"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft-primary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded";

    const variantStyles = {
      primary:
        "bg-primary-600 text-white font-semibold hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500 shadow-sm dark:bg-primary-400 dark:text-slate-950 dark:hover:bg-primary-300 dark:active:bg-primary-500",
      "soft-primary":
        "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 dark:bg-primary-400/15 dark:text-primary-400 dark:border-primary-400/25 dark:hover:bg-primary-400/25 focus:ring-primary-500 font-semibold",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-galaxy-hover dark:text-slate-200 dark:hover:bg-galaxy-hover/80 focus:ring-slate-400",
      outline:
        "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-galaxy-border dark:text-slate-200 dark:hover:bg-galaxy-hover focus:ring-primary-500",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-galaxy-hover focus:ring-primary-500",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm font-semibold",
    };

    const sizeStyles = {
      sm: "text-2xs px-2.5 py-1.5 h-7 gap-1",
      md: "text-xs px-3.5 py-2 h-[37.5px] gap-1.5",
      lg: "text-sm px-5 py-2.5 h-11 gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
