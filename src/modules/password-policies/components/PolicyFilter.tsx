"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, RotateCcw, Key, SlidersHorizontal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { SelectOption } from "@/types";

export interface PolicyFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

export function PolicyFilter({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onReset,
}: PolicyFilterProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localStatus, setLocalStatus] = useState(status);

  useEffect(() => {
    setLocalSearch(search);
    setLocalStatus(status);
  }, [search, status]);

  const statusOptions: SelectOption[] = useMemo(() => [
    { value: "", label: "Semua Status Kebijakan" },
    { value: "ACTIVE", label: "Aktif (Diterapkan)" },
    { value: "INACTIVE", label: "Non-Aktif (Diabaikan)" },
  ], []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchChange(localSearch);
    onStatusChange(localStatus);
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalStatus("");
    onReset();
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Filter Kebijakan Kata Sandi
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Status with Select2 */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary-400" />
                <span>Status Aturan</span>
              </label>
              <SearchableSelect
                size="sm"
                options={statusOptions}
                value={localStatus}
                onChange={(val) => setLocalStatus(val)}
                placeholder="Pilih Status..."
                searchPlaceholder="Cari status..."
                clearable={Boolean(localStatus)}
              />
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Key className="h-3.5 w-3.5 text-primary-400" />
                <span>Pencarian Kode atau Pesan Kebijakan</span>
              </label>
              <input
                type="text"
                placeholder="Cari kode aturan (cth: MIN_LENGTH) atau pesan validasi..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="gap-1.5 shadow-galaxy-cyan"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Cari</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
