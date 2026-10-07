"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, RotateCcw, Shield, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { UserGroup, SelectOption } from "@/types";

export interface UserFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedGroup: string;
  onGroupChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedLock: string;
  onLockChange: (value: string) => void;
  onReset: () => void;
  onExport?: () => void;
  onOpenCreate?: () => void;
  usergroups: UserGroup[];
}

export function UserFilter({
  search,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  selectedStatus,
  onStatusChange,
  selectedLock,
  onLockChange,
  onReset,
  usergroups,
}: UserFilterProps) {
  // Local state for filter inputs
  const [localSearch, setLocalSearch] = useState(search);
  const [localGroup, setLocalGroup] = useState(selectedGroup);
  const [localStatus, setLocalStatus] = useState(selectedStatus);
  const [localLock, setLocalLock] = useState(selectedLock);

  // Sync from props if changed externally
  useEffect(() => {
    setLocalSearch(search);
    setLocalGroup(selectedGroup);
    setLocalStatus(selectedStatus);
    setLocalLock(selectedLock);
  }, [search, selectedGroup, selectedStatus, selectedLock]);

  // Options for SearchableSelect (Select2)
  const usergroupOptions: SelectOption[] = useMemo(() => [
    { value: "", label: "Semua User Group" },
    ...usergroups.map((g) => ({
      value: g.usergroupId,
      label: `${g.usergroupName} (${g.usergroupCode})`,
    })),
  ], [usergroups]);

  const statusOptions: SelectOption[] = useMemo(() => [
    { value: "", label: "Semua Status Keaktifan" },
    { value: "Y", label: "Aktif (Y)" },
    { value: "N", label: "Non-Aktif (N)" },
  ], []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearchChange(localSearch);
    onGroupChange(localGroup);
    onStatusChange(localStatus);
    onLockChange(localLock);
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalGroup("");
    setLocalStatus("");
    setLocalLock("");
    onReset();
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Filter Daftar Pengguna
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* User Group with SearchableSelect (Select2) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Shield className="h-3.5 w-3.5 text-primary-400" />
                <span>Role / User Group</span>
              </label>
              <SearchableSelect
                size="sm"
                options={usergroupOptions}
                value={localGroup}
                onChange={(val) => setLocalGroup(val)}
                placeholder="Pilih User Group..."
                searchPlaceholder="Cari role atau kode..."
                clearable={Boolean(localGroup)}
              />
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Search className="h-3.5 w-3.5 text-primary-400" />
                <span>Pencarian Pengguna</span>
              </label>
              <input
                type="text"
                placeholder="Nama lengkap, username, atau email..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
              />
            </div>

            {/* Status Keaktifan with SearchableSelect (Select2) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <UserCheck className="h-3.5 w-3.5 text-primary-400" />
                <span>Status Keaktifan</span>
              </label>
              <SearchableSelect
                size="sm"
                options={statusOptions}
                value={localStatus}
                onChange={(val) => setLocalStatus(val)}
                placeholder="Pilih status..."
                searchPlaceholder="Cari status..."
                clearable={Boolean(localStatus)}
              />
            </div>
          </div>

          {/* Action Buttons */}
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
