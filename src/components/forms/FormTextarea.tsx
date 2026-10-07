"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
  showCount?: boolean;
  hasError?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      className,
      maxLength,
      showCount = false,
      hasError,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            "flex min-h-[90px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-galaxy-input dark:text-slate-100 dark:placeholder:text-slate-500",
            hasError
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-primary-400 focus:ring-primary-400/20 dark:border-galaxy-border dark:focus:border-primary-400",
            className
          )}
          {...props}
        />
        {showCount && maxLength && (
          <div className="mt-1 text-right text-[11px] text-slate-400">
            {currentLength} / {maxLength} karakter
          </div>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
