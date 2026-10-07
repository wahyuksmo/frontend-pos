"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FolderTree, Table2, ShieldAlert } from "lucide-react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import {
  PermissionGroupSelector,
  PermissionMatrixTable,
  PermissionMatrixTree,
  PermKey,
  PermissionsRowData,
} from "@/modules/permissions";
import { usergroupsService, menusService, permissionsService } from "@/services";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeAlert,
} from "@/lib/sweetalert";
import { cn } from "@/lib/utils";
import type { UserGroup, Menu } from "@/types";

export interface PermissionsMatrixViewProps {
  showTitleBox?: boolean;
}

function PermissionsMatrixViewContent({ showTitleBox = true }: PermissionsMatrixViewProps) {
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("group") || "";

  const [usergroups, setUsergroups] = useState<UserGroup[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<"tree" | "table">("tree");

  // Local permissions matrix map: key = menuId, value = { readPerm, createPerm, ... }
  const [matrix, setMatrix] = useState<Record<string, PermissionsRowData>>({});

  // Fetch initial usergroups & menus
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [groupsRes, menusRes] = await Promise.all([
          usergroupsService.findAll({ limit: 100 }),
          menusService.findAll({ limit: 100 }),
        ]);
        const groups = groupsRes.data || [];
        setUsergroups(groups);
        setMenus(menusRes.data || []);

        // Prefer first non-superadmin role (SUPERVISOR or CASHIER) so user can edit right away
        const defaultRole = groups.find((g) => g.usergroupCode !== "SUPERADMIN") || groups[0];
        const targetGroup = initialGroupId || (defaultRole?.usergroupId ?? "");
        setSelectedGroupId(targetGroup);
      } catch (err: any) {
        showErrorAlert("Gagal Memuat", err.message || "Gagal memuat data master.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [initialGroupId]);

  // When selectedGroupId changes, fetch its permissions
  useEffect(() => {
    if (!selectedGroupId) return;

    const loadGroupPermissions = async () => {
      try {
        const res = await permissionsService.findByUserGroup(selectedGroupId);
        const perms = res.data || [];

        // Build mapping
        const newMatrix: Record<string, PermissionsRowData> = {};
        for (const m of menus) {
          const found = perms.find((p) => p.menuId === m.menuId);
          newMatrix[m.menuId] = {
            readPerm: found?.readPerm || "N",
            createPerm: found?.createPerm || "N",
            updatePerm: found?.updatePerm || "N",
            deletePerm: found?.deletePerm || "N",
            exportPerm: found?.exportPerm || "N",
            importPerm: found?.importPerm || "N",
          };
        }
        setMatrix(newMatrix);
      } catch (err: any) {
        console.error("Failed loading group permissions", err);
      }
    };

    if (menus.length > 0) {
      loadGroupPermissions();
    }
  }, [selectedGroupId, menus]);

  // Toggle single cell
  const handleToggle = (menuId: string, perm: PermKey) => {
    setMatrix((prev) => {
      const current = prev[menuId] || {
        readPerm: "N",
        createPerm: "N",
        updatePerm: "N",
        deletePerm: "N",
        exportPerm: "N",
        importPerm: "N",
      };
      const newVal = current[perm] === "Y" ? "N" : "Y";
      return {
        ...prev,
        [menuId]: {
          ...current,
          [perm]: newVal,
          // If enabling create/update/delete/export/import, auto-enable read
          ...(perm !== "readPerm" && newVal === "Y" ? { readPerm: "Y" } : {}),
        },
      };
    });
  };

  // Toggle all permissions for a specific menu row
  const handleToggleRow = (menuId: string, enableAll: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [menuId]: {
        readPerm: enableAll ? "Y" : "N",
        createPerm: enableAll ? "Y" : "N",
        updatePerm: enableAll ? "Y" : "N",
        deletePerm: enableAll ? "Y" : "N",
        exportPerm: enableAll ? "Y" : "N",
        importPerm: enableAll ? "Y" : "N",
      },
    }));
  };

  // Select all or deselect all across all menus
  const handleToggleAll = (enableAll: boolean) => {
    const newMatrix: Record<string, PermissionsRowData> = {};
    for (const m of menus) {
      newMatrix[m.menuId] = {
        readPerm: enableAll ? "Y" : "N",
        createPerm: enableAll ? "Y" : "N",
        updatePerm: enableAll ? "Y" : "N",
        deletePerm: enableAll ? "Y" : "N",
        exportPerm: enableAll ? "Y" : "N",
        importPerm: enableAll ? "Y" : "N",
      };
    }
    setMatrix(newMatrix);
  };

  // Batch toggle for branch / tree nodes
  const handleToggleBatch = (menuIds: string[], enableAll: boolean) => {
    setMatrix((prev) => {
      const next = { ...prev };
      menuIds.forEach((id) => {
        next[id] = {
          readPerm: enableAll ? "Y" : "N",
          createPerm: enableAll ? "Y" : "N",
          updatePerm: enableAll ? "Y" : "N",
          deletePerm: enableAll ? "Y" : "N",
          exportPerm: enableAll ? "Y" : "N",
          importPerm: enableAll ? "Y" : "N",
        };
      });
      return next;
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedGroupId) return;
    setSaving(true);
    showLoadingAlert("Menyimpan Matriks...", "Memperbarui aturan hak akses ke database...");

    try {
      const permissionsPayload = Object.entries(matrix).map(([menuId, perms]) => ({
        menuId,
        ...perms,
      }));

      await permissionsService.batchUpdate({
        usergroupId: selectedGroupId,
        permissions: permissionsPayload,
      });

      closeAlert();
      await showSuccessAlert(
        "Berhasil Disimpan!",
        "Matriks hak akses untuk role terpilih telah berhasil diperbarui."
      );
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Menyimpan", err.message || "Gagal memperbarui matriks hak akses.");
    } finally {
      setSaving(false);
    }
  };

  const selectedGroup = useMemo(() => {
    return usergroups.find((g) => g.usergroupId === selectedGroupId);
  }, [usergroups, selectedGroupId]);

  const isSuperAdmin = selectedGroup?.usergroupCode === "SUPERADMIN";

  return (
    <div className="space-y-5">
      {showTitleBox && (
        <PageTitleBox title="Matriks Hak Akses (Permissions Matrix)" category="Manajemen Akses" />
      )}

      {/* Role Selector Card */}
      <PermissionGroupSelector
        usergroups={usergroups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={setSelectedGroupId}
        onToggleAll={handleToggleAll}
        onSave={handleSave}
        saving={saving}
      />

      {isSuperAdmin && (
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>Informasi:</strong> Role <strong>Super Administrator</strong> memiliki hak akses penuh permanen ke seluruh menu modul POS dan tidak dapat diubah (immutable). Pilih role seperti <strong>Kasir POS</strong> atau <strong>Store Supervisor</strong> untuk menyesuaikan izin akses.
          </span>
        </div>
      )}

      {/* View Switcher: Tree View vs Grid Table */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white p-1.5 shadow-sm dark:border-galaxy-border/80 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setActiveView("tree")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all",
              activeView === "tree"
                ? "bg-primary-400 text-slate-950 font-bold shadow-galaxy-cyan"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <FolderTree className="h-3.5 w-3.5" />
            <span>Tampilan Matrix Tree (Hirarkis)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("table")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all",
              activeView === "table"
                ? "bg-primary-400 text-slate-950 font-bold shadow-galaxy-cyan"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Table2 className="h-3.5 w-3.5" />
            <span>Tampilan Tabel Grid (Datar)</span>
          </button>
        </div>
      </div>

      {/* Active Matrix View */}
      {activeView === "tree" ? (
        <PermissionMatrixTree
          menus={menus}
          selectedGroup={selectedGroup}
          matrix={matrix}
          loading={loading}
          onToggle={handleToggle}
          onToggleRow={handleToggleRow}
          onToggleBatch={handleToggleBatch}
        />
      ) : (
        <PermissionMatrixTable
          menus={menus}
          selectedGroup={selectedGroup}
          matrix={matrix}
          loading={loading}
          onToggle={handleToggle}
          onToggleRow={handleToggleRow}
        />
      )}
    </div>
  );
}

export function PermissionsMatrixView(props: PermissionsMatrixViewProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat matriks akses...</div>}>
      <PermissionsMatrixViewContent {...props} />
    </Suspense>
  );
}
