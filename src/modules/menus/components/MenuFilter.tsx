"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, RotateCcw, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { Menu, SelectOption } from "@/types";

export interface MenuFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedParent: string;
  onParentChange: (value: string) => void;
  onReset: () => void;
  rootMenus: Menu[];
}

export function MenuFilter({
  search,
  onSearchChange,
  selectedParent,
  onParentChange,
  onReset,
  rootMenus,
}: MenuFilterProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localParent, setLocalParent] = useState(selectedParent);

  useEffect(() => {
    setLocalSearch(search);
    setLocalParent(selectedParent);
  }, [search, selectedParent]);

  const parentOptions: SelectOption[] = useMemo(() => [
    { value: "", label: "Semua Tingkatan Menu" },
    { value: "ROOT", label: "Menu Utama (Root Level Saja)" },
    ...rootMenus.map((r) => ({
      value: r.menuId,
      label: `${r.menuTitle} (${r.menuName})`,
    })),
  ], [rootMenus]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchChange(localSearch);
    onParentChange(localParent);
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalParent("");
    onReset();
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Filter Daftar Menu
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Parent Menu Select2 */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Layers className="h-3.5 w-3.5 text-primary-400" />
                <span>Tingkatan Menu / Induk</span>
              </label>
              <SearchableSelect
                size="sm"
                options={parentOptions}
                value={localParent}
                onChange={(val) => setLocalParent(val)}
                placeholder="Pilih Menu Induk..."
                searchPlaceholder="Cari menu induk..."
                clearable={Boolean(localParent)}
              />
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Search className="h-3.5 w-3.5 text-primary-400" />
                <span>Pencarian Kode atau Judul Menu</span>
              </label>
              <input
                type="text"
                placeholder="Cari berdasarkan judul menu (cth: Pengaturan) atau kode menu..."
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
