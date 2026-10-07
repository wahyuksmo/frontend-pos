"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", hasError, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-galaxy-input dark:text-slate-100 dark:placeholder:text-slate-500",
            hasError
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-galaxy-border dark:focus:border-primary-400 dark:focus:ring-primary-400/20",
            className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
