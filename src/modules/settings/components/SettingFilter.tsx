"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, RotateCcw, Sliders, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { SelectOption } from "@/types";

export interface SettingFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedValueType: string;
  onValueTypeChange: (value: string) => void;
  onReset: () => void;
}

export function SettingFilter({
  search,
  onSearchChange,
  selectedValueType,
  onValueTypeChange,
  onReset,
}: SettingFilterProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localValueType, setLocalValueType] = useState(selectedValueType);

  useEffect(() => {
    setLocalSearch(search);
    setLocalValueType(selectedValueType);
  }, [search, selectedValueType]);

  const valueTypeOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "Semua Tipe Data" },
      { value: "string", label: "String" },
      { value: "number", label: "Number" },
      { value: "boolean", label: "Boolean" },
      { value: "json", label: "JSON" },
    ],
    []
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchChange(localSearch);
    onValueTypeChange(localValueType);
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalValueType("");
    onReset();
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Filter Pengaturan Sistem
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Search className="h-3.5 w-3.5 text-primary-400" />
                <span>Pencarian Kata Kunci</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari key, value, atau deskripsi..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
                />
              </div>
            </div>

            {/* Value Type with SearchableSelect */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Sliders className="h-3.5 w-3.5 text-primary-400" />
                <span>Tipe Nilai</span>
              </label>
              <SearchableSelect
                size="sm"
                options={valueTypeOptions}
                value={localValueType}
                onChange={(v) => setLocalValueType(v)}
                placeholder="Pilih tipe..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-galaxy-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset Filter</span>
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="gap-1.5 shadow-galaxy-cyan"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Terapkan Filter</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
