"use client";

import React, { useState } from "react";
import { Search, RotateCcw, Filter, Warehouse as WarehouseIcon, Store } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { SelectOption } from "@/types";

export interface WarehousesFilterProps {
  search: string;
  outletId?: string;
  warehouseType?: string;
  isActive?: string;
  outletOptions?: SelectOption[];
  onSearchChange: (search: string) => void;
  onOutletChange?: (outletId: string) => void;
  onTypeChange?: (type: string) => void;
  onStatusChange?: (status: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export function WarehousesFilter({
  search,
  outletId = "",
  warehouseType = "",
  isActive = "",
  outletOptions = [],
  onSearchChange,
  onOutletChange,
  onTypeChange,
  onStatusChange,
  onFilter,
  onReset,
}: WarehousesFilterProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localOutlet, setLocalOutlet] = useState(outletId);
  const [localType, setLocalType] = useState(warehouseType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
    if (onOutletChange) onOutletChange(localOutlet);
    if (onTypeChange) onTypeChange(localType);
    onFilter();
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalOutlet("");
    setLocalType("");
    onSearchChange("");
    if (onOutletChange) onOutletChange("");
    if (onTypeChange) onTypeChange("");
    onReset();
  };

  const typeOptions = [
    { value: "", label: "Semua Jenis Gudang" },
    { value: "GENERAL", label: "Gudang Utama (General)" },
    { value: "KITCHEN", label: "Dapur Resto (Kitchen)" },
    { value: "BAR", label: "Bar Minuman" },
    { value: "TRANSIT", label: "Transit / Logistik" },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-primary-400" />
          <span>Filter Master Gudang</span>
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
                placeholder="Kode atau nama gudang..."
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
                options={[{ value: "", label: "Semua Outlet / Sentral" }, ...outletOptions]}
                value={localOutlet}
                onChange={setLocalOutlet}
                placeholder="Pilih Outlet..."
                clearable={Boolean(localOutlet)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <WarehouseIcon className="h-3.5 w-3.5 text-primary-400" />
                <span>Tipe Gudang</span>
              </label>
              <SearchableSelect
                size="sm"
                options={typeOptions}
                value={localType}
                onChange={setLocalType}
                placeholder="Pilih Tipe..."
                clearable={Boolean(localType)}
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
