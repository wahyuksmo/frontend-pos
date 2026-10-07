import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
    xl: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("inline-flex flex-col items-center justify-center gap-2", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-primary-400 border-t-transparent shadow-galaxy-cyan",
          sizeMap[size]
        )}
      />
      {label && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide font-heading">
          {label}
        </span>
      )}
    </div>
  );
}
