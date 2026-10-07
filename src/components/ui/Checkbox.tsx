"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  hasError?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      label,
      description,
      hasError,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <label
        className={cn(
          "inline-flex items-start gap-2.5 cursor-pointer select-none",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-4 w-4 rounded border transition-colors flex items-center justify-center",
              checked
                ? "bg-primary-600 border-primary-600 dark:bg-primary-400 dark:border-primary-400"
                : hasError
                ? "border-rose-500 bg-white dark:bg-galaxy-input"
                : "border-slate-300 bg-white dark:border-galaxy-border dark:bg-galaxy-input hover:border-primary-500 dark:hover:border-primary-400"
            )}
          >
            {checked && <Check className="h-3 w-3 stroke-[3] text-white dark:text-slate-950" />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-sm">
            {label && (
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
