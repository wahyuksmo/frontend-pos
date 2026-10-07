"use client";

import React from "react";
import { MenuSquare, FolderTree, Layers } from "lucide-react";

interface MenuStatsCardsProps {
  totalMenus: number;
  rootCount: number;
  subCount: number;
}

export function MenuStatsCards({ totalMenus, rootCount, subCount }: MenuStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-galaxy-border/80 dark:bg-galaxy-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-400/10 text-primary-400 border border-primary-400/20">
          <MenuSquare className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-galaxy-menuTitle font-medium">Total Item Menu</p>
          <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">{totalMenus}</h4>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-galaxy-border/80 dark:bg-galaxy-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <FolderTree className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-galaxy-menuTitle font-medium">Menu Induk (Root)</p>
          <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">{rootCount}</h4>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-galaxy-border/80 dark:bg-galaxy-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-galaxy-menuTitle font-medium">Sub-Menu Terkait</p>
          <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">{subCount}</h4>
        </div>
      </div>
    </div>
  );
}
