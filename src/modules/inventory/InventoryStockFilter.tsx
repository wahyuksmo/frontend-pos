"use client";

import React, { useState } from "react";
import { Search, RotateCcw, Warehouse, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { SelectOption } from "@/types";

export interface InventoryStockFilterProps {
  search: string;
  warehouseId?: string;
  isLowStock?: string;
  warehouseOptions: SelectOption[];
  onSearchChange: (val: string) => void;
  onWarehouseChange: (val: string) => void;
  onLowStockChange: (val: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export function InventoryStockFilter({
  search,
  warehouseId = "",
  isLowStock = "",
  warehouseOptions = [],
  onSearchChange,
  onWarehouseChange,
  onLowStockChange,
  onFilter,
  onReset,
}: InventoryStockFilterProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localWarehouse, setLocalWarehouse] = useState(warehouseId);
  const [localLowStock, setLocalLowStock] = useState(isLowStock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
    onWarehouseChange(localWarehouse);
    onLowStockChange(localLowStock);
    onFilter();
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalWarehouse("");
    setLocalLowStock("");
    onSearchChange("");
    onWarehouseChange("");
    onLowStockChange("");
    onReset();
  };

  const lowStockOptions = [
    { value: "", label: "Semua Level Stok" },
    { value: "Y", label: "⚠️ Stok Menipis (<= Min Stock)" },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Filter Saldo Stok
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Lokasi Gudang */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Warehouse className="h-3.5 w-3.5 text-primary-400" />
                <span>Lokasi Gudang</span>
              </label>
              <SearchableSelect
                size="sm"
                options={warehouseOptions}
                value={localWarehouse}
                onChange={setLocalWarehouse}
                placeholder="Semua Gudang"
                clearable={Boolean(localWarehouse)}
              />
            </div>

            {/* Peringatan Stok */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span>Level Stok</span>
              </label>
              <SearchableSelect
                size="sm"
                options={lowStockOptions}
                value={localLowStock}
                onChange={setLocalLowStock}
                placeholder="Semua Level"
                clearable={Boolean(localLowStock)}
              />
            </div>

            {/* Kata Kunci */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Search className="h-3.5 w-3.5 text-primary-400" />
                <span>Cari Produk / SKU / Barcode</span>
              </label>
              <input
                type="text"
                placeholder="Ketik nama atau kode barang..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
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
