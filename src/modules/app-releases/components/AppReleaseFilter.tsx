"use client";

import React from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface AppReleaseFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onReset: () => void;
}

export function AppReleaseFilter({
  search,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onReset,
}: AppReleaseFilterProps) {
  return (
    <Card className="border-slate-200 dark:border-galaxy-border bg-white dark:bg-galaxy-card shadow-sm mb-6">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari versi, nama file, atau catatan rilis..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-10 w-full text-xs"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="h-10 rounded-md border border-slate-200 dark:border-galaxy-border bg-white dark:bg-galaxy-input px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Semua Status</option>
                <option value="Y">Aktif Saja</option>
                <option value="N">Nonaktif Saja</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-2">
            {(search || selectedStatus) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 gap-1.5 h-10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
