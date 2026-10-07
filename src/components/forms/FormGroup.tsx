import React from "react";
import { cn } from "@/lib/utils";

export interface FormGroupProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
  layout?: "vertical" | "horizontal";
  htmlFor?: string;
}

export function FormGroup({
  label,
  required,
  error,
  helperText,
  children,
  className,
  layout = "vertical",
  htmlFor,
}: FormGroupProps) {
  if (layout === "horizontal") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-4 sm:items-start gap-2 sm:gap-4", className)}>
        {label && (
          <label
            htmlFor={htmlFor}
            className="sm:col-span-1 text-sm font-medium text-slate-700 dark:text-slate-200 sm:pt-2"
          >
            {label}
            {required && <span className="ml-1 text-rose-500 font-bold">*</span>}
          </label>
        )}
        <div className={cn(label ? "sm:col-span-3" : "sm:col-span-4", "space-y-1.5")}>
          {children}
          {helperText && !error && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
          )}
          {error && <p className="text-xs font-medium text-rose-500 animate-in fade-in">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
          {required && <span className="ml-1 text-rose-500 font-bold">*</span>}
        </label>
      )}
      {children}
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      {error && <p className="text-xs font-medium text-rose-500 animate-in fade-in">{error}</p>}
    </div>
  );
}
