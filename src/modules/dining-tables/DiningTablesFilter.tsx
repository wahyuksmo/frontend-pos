"use client";

import React, { useState } from "react";
import { Search, RotateCcw, Filter, UtensilsCrossed, Store } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { SelectOption } from "@/types";

export interface DiningTablesFilterProps {
  search: string;
  outletId?: string;
  status?: string;
  isActive?: string;
  outletOptions?: SelectOption[];
  onSearchChange: (search: string) => void;
  onOutletChange?: (outletId: string) => void;
  onStatusChange?: (status: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export function DiningTablesFilter({
  search,
  outletId = "",
  status = "",
  outletOptions = [],
  onSearchChange,
  onOutletChange,
  onStatusChange,
  onFilter,
  onReset,
}: DiningTablesFilterProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localOutlet, setLocalOutlet] = useState(outletId);
  const [localStatus, setLocalStatus] = useState(status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
    if (onOutletChange) onOutletChange(localOutlet);
    if (onStatusChange) onStatusChange(localStatus);
    onFilter();
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalOutlet("");
    setLocalStatus("");
    onSearchChange("");
    if (onOutletChange) onOutletChange("");
    if (onStatusChange) onStatusChange("");
    onReset();
  };

  const statusOptions = [
    { value: "", label: "Semua Ketersediaan" },
    { value: "AVAILABLE", label: "Tersedia (Available)" },
    { value: "OCCUPIED", label: "Terisi (Occupied)" },
    { value: "RESERVED", label: "Dipesan (Reserved)" },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-primary-400" />
          <span>Filter Meja Resto</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Search className="h-3.5 w-3.5 text-primary-400" />
                <span>Pencarian Kata Kunci</span>
              </label>
              <input
                type="text"
                placeholder="Nomor meja, nama, atau area..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Store className="h-3.5 w-3.5 text-primary-400" />
                <span>Cabang Outlet</span>
              </label>
              <SearchableSelect
                size="sm"
                options={[{ value: "", label: "Semua Outlet" }, ...outletOptions]}
                value={localOutlet}
                onChange={setLocalOutlet}
                placeholder="Pilih Outlet..."
                clearable={Boolean(localOutlet)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <UtensilsCrossed className="h-3.5 w-3.5 text-primary-400" />
                <span>Status Ketersediaan</span>
              </label>
              <SearchableSelect
                size="sm"
                options={statusOptions}
                value={localStatus}
                onChange={setLocalStatus}
                placeholder="Pilih Status..."
                clearable={Boolean(localStatus)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" variant="primary" size="sm" className="gap-1.5 shadow-galaxy-cyan">
              <Search className="h-3.5 w-3.5" />
              <span>Cari</span>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
