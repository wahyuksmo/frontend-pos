"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, RotateCcw, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { SelectOption } from "@/types";

export interface ApprovalTemplateFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  objectCode: string;
  onObjectCodeChange: (value: string) => void;
  onReset: () => void;
  moduleOptions?: SelectOption[];
}

export function ApprovalTemplateFilter({
  search,
  onSearchChange,
  objectCode,
  onObjectCodeChange,
  onReset,
  moduleOptions = [],
}: ApprovalTemplateFilterProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localObjectCode, setLocalObjectCode] = useState(objectCode);

  useEffect(() => {
    setLocalSearch(search);
    setLocalObjectCode(objectCode);
  }, [search, objectCode]);

  const selectOptions: SelectOption[] = useMemo(() => [
    { value: "", label: "Semua Modul Objek" },
    ...moduleOptions,
  ], [moduleOptions]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchChange(localSearch);
    onObjectCodeChange(localObjectCode);
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalObjectCode("");
    onReset();
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Filter Template Approval
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Search className="h-3.5 w-3.5 text-primary-400" />
                <span>Pencarian Template</span>
              </label>
              <input
                type="text"
                placeholder="Cari kode atau nama template approval..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
              />
            </div>

            {/* Object Code Filter with SearchableSelect */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Layers className="h-3.5 w-3.5 text-primary-400" />
                <span>Modul Target Objek</span>
              </label>
              <SearchableSelect
                size="sm"
                options={selectOptions}
                value={localObjectCode}
                onChange={(val) => setLocalObjectCode(val)}
                placeholder="Pilih modul target..."
                searchPlaceholder="Cari modul..."
                clearable={Boolean(localObjectCode)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-galaxy-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
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

