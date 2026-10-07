"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (value: string) => void;
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      value,
      checked = false,
      onCheckedChange,
      label,
      description,
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
            type="radio"
            ref={ref}
            value={value}
            checked={checked}
            disabled={disabled}
            onChange={() => onCheckedChange?.(String(value))}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-4 w-4 rounded-full border transition-all flex items-center justify-center",
              checked
                ? "border-primary-600 bg-primary-600 dark:border-primary-400 dark:bg-primary-400"
                : "border-slate-300 bg-white dark:border-galaxy-border dark:bg-galaxy-input hover:border-primary-500 dark:hover:border-primary-400"
            )}
          >
            {checked && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-950" />}
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

Radio.displayName = "Radio";
