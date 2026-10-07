"use client";

import React, { useEffect, useState } from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { warehousesService } from "@/services";
import type { SelectOption } from "@/types";

export interface ProductionFilterProps {
  search: string;
  warehouseId: string;
  startDate: string;
  endDate: string;
  onSearchChange: (val: string) => void;
  onWarehouseChange: (val: string) => void;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export function ProductionFilter({
  search,
  warehouseId,
  startDate,
  endDate,
  onSearchChange,
  onWarehouseChange,
  onStartDateChange,
  onEndDateChange,
  onFilter,
  onReset,
}: ProductionFilterProps) {
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    warehousesService.findAll({ limit: 100, isActive: "Y" }).then((res) => {
      setWarehouseOptions([
        { value: "", label: "Semua Gudang / Dapur" },
        ...(res.data || []).map((w) => ({
          value: w.warehouseId,
          label: `${w.warehouseName} (${w.warehouseCode})`,
        })),
      ]);
    });
  }, []);

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardContent className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onFilter();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end"
        >
          {/* Search Input */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 font-heading">
              Cari No. Dokumen / Menu
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nomor produksi atau nama menu..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Warehouse Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 font-heading">
              Gudang / Dapur
            </label>
            <SearchableSelect
              options={warehouseOptions}
              value={warehouseId}
              onChange={onWarehouseChange}
              placeholder="Semua Gudang"
            />
          </div>

          {/* Date Range Start */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 font-heading">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" className="h-9 flex-1 gap-1.5 shadow-galaxy-cyan">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-9 px-3 text-slate-500 hover:text-slate-700 dark:text-slate-400"
              title="Reset Filter"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
