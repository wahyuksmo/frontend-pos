import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-galaxy-card/80 backdrop-blur-md shadow-2xl">
        <LoadingSpinner size="lg" />
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mt-4">
          Memuat Data Galaxy...
        </span>
        <span className="text-[11px] text-slate-400 mt-1">
          Mohon tunggu sejenak selagi modul disiapkan
        </span>
      </div>
    </div>
  );
}
