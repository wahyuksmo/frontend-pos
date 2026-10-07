import React from "react";
import { cn } from "@/lib/utils";

export interface FormSectionProps {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export function FormSection({ title, description, className, action }: FormSectionProps) {
  return (
    <div className={cn("pt-4 pb-2 border-b border-slate-200 dark:border-galaxy-border/70 mb-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-heading text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-primary-400 rounded-full inline-block shadow-sm shadow-primary-400/50" />
            {title}
          </h4>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-3.5">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
