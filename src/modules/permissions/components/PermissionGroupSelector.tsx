"use client";

import React, { useMemo } from "react";
import { ShieldCheck, CheckSquare, Square, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { UserGroup, SelectOption } from "@/types";

interface PermissionGroupSelectorProps {
  usergroups: UserGroup[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onToggleAll: (enableAll: boolean) => void;
  onSave: () => void;
  saving: boolean;
}

export function PermissionGroupSelector({
  usergroups,
  selectedGroupId,
  onSelectGroup,
  onToggleAll,
  onSave,
  saving,
}: PermissionGroupSelectorProps) {
  const options: SelectOption[] = useMemo(() => {
    return usergroups.map((g) => ({
      value: g.usergroupId,
      label: `${g.usergroupName} (${g.usergroupCode})`,
    }));
  }, [usergroups]);

  const isSuperAdmin = useMemo(() => {
    return usergroups.find((g) => g.usergroupId === selectedGroupId)?.usergroupCode === "SUPERADMIN";
  }, [usergroups, selectedGroupId]);

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-400/10 text-primary-400 border border-primary-400/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 max-w-sm">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1 font-heading">
                Pilih User Group / Role Target
              </label>
              <SearchableSelect
                size="sm"
                options={options}
                value={selectedGroupId}
                onChange={onSelectGroup}
                placeholder="Pilih Role Target..."
                searchPlaceholder="Cari role..."
                clearable={false}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isSuperAdmin}
              onClick={() => onToggleAll(true)}
              className="gap-1.5 text-xs"
            >
              <CheckSquare className="h-3.5 w-3.5 text-primary-400" />
              <span>Centang Semua</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isSuperAdmin}
              onClick={() => onToggleAll(false)}
              className="gap-1.5 text-xs"
            >
              <Square className="h-3.5 w-3.5 text-slate-400" />
              <span>Hapus Semua</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={isSuperAdmin}
              onClick={onSave}
              isLoading={saving}
              className="gap-1.5 text-xs shadow-galaxy-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSuperAdmin ? "Akses Terkunci (Full)" : "Simpan Perubahan"}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
