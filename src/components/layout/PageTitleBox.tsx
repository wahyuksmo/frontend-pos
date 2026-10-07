import React from "react";
import Link from "next/link";

export interface PageTitleBoxProps {
  title: string;
  category?: string;
  children?: React.ReactNode;
}

export function PageTitleBox({
  title,
  category = "Dashboard",
  children,
}: PageTitleBoxProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 pt-1 mb-2 gap-2">
      <div>
        <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
          {title}
        </h4>
      </div>

      <div className="flex items-center gap-3">
        {children}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 select-none">
          <Link
            href="/"
            className="hover:text-primary-400 transition-colors text-slate-500 dark:text-slate-400"
          >
            {category}
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200 font-medium">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}
