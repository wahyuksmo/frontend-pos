"use client";

import React from "react";
import { Eye, PlusCircle, Edit, Trash2, Download, Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Menu, UserGroup } from "@/types";

export type PermKey = "readPerm" | "createPerm" | "updatePerm" | "deletePerm" | "exportPerm" | "importPerm";

export interface PermissionsRowData {
  readPerm: "Y" | "N";
  createPerm: "Y" | "N";
  updatePerm: "Y" | "N";
  deletePerm: "Y" | "N";
  exportPerm: "Y" | "N";
  importPerm: "Y" | "N";
}

interface PermissionMatrixTableProps {
  menus: Menu[];
  selectedGroup?: UserGroup;
  matrix: Record<string, PermissionsRowData>;
  loading: boolean;
  onToggle: (menuId: string, perm: PermKey) => void;
  onToggleRow: (menuId: string, enableAll: boolean) => void;
}

export function PermissionMatrixTable({
  menus,
  selectedGroup,
  matrix,
  loading,
  onToggle,
  onToggleRow,
}: PermissionMatrixTableProps) {
  const permColumns: Array<{ key: PermKey; label: string; icon: React.ReactNode }> = [
    { key: "readPerm", label: "Lihat (Read)", icon: <Eye className="h-3.5 w-3.5" /> },
    { key: "createPerm", label: "Tambah (Create)", icon: <PlusCircle className="h-3.5 w-3.5" /> },
    { key: "updatePerm", label: "Ubah (Update)", icon: <Edit className="h-3.5 w-3.5" /> },
    { key: "deletePerm", label: "Hapus (Delete)", icon: <Trash2 className="h-3.5 w-3.5" /> },
    { key: "exportPerm", label: "Ekspor (Export)", icon: <Download className="h-3.5 w-3.5" /> },
    { key: "importPerm", label: "Impor (Import)", icon: <Upload className="h-3.5 w-3.5" /> },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border py-4">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-slate-800 dark:text-slate-100 font-heading">
            Matriks Modul Menu — Role: {selectedGroup?.usergroupName || "Memuat..."}
          </CardTitle>
          <p className="text-xs text-slate-400 mt-0.5">
            Tentukan hak akses Create, Read, Update, Delete, Export, dan Import secara granular per modul.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 dark:border-galaxy-border dark:bg-galaxy-thead text-slate-500 dark:text-galaxy-menuTitle">
                  <th className="py-3 px-4 font-semibold min-w-[200px]">MODUL MENU</th>
                  {permColumns.map((col) => (
                    <th key={col.key} className="py-3 px-3 font-semibold text-center">
                      <div className="inline-flex items-center gap-1">
                        {col.icon}
                        <span>{col.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 font-semibold text-right">AKSI CEPAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/50 text-slate-700 dark:text-slate-300">
                {menus.map((menu) => {
                  const rowPerms = matrix[menu.menuId] || {
                    readPerm: "N",
                    createPerm: "N",
                    updatePerm: "N",
                    deletePerm: "N",
                    exportPerm: "N",
                    importPerm: "N",
                  };
                  const isAllChecked =
                    rowPerms.readPerm === "Y" &&
                    rowPerms.createPerm === "Y" &&
                    rowPerms.updatePerm === "Y" &&
                    rowPerms.deletePerm === "Y" &&
                    rowPerms.exportPerm === "Y" &&
                    rowPerms.importPerm === "Y";

                  const isSubmenu = Boolean(menu.pid);

                  return (
                    <tr
                      key={menu.menuId}
                      className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                    >
                      {/* Menu Title */}
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-2 ${isSubmenu ? "pl-5 border-l-2 border-primary-400/30 ml-2" : ""}`}>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {menu.menuTitle}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({menu.menuName})
                          </span>
                        </div>
                      </td>

                      {/* Perm Columns */}
                      {permColumns.map((col) => {
                        const isChecked = rowPerms[col.key] === "Y";
                        return (
                          <td key={col.key} className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onToggle(menu.menuId, col.key)}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded transition-all ${
                                isChecked
                                  ? "bg-primary-400 text-slate-950 font-bold shadow-sm shadow-primary-400/50"
                                  : "bg-slate-100 text-slate-300 hover:bg-slate-200 dark:bg-galaxy-input dark:text-slate-600 dark:hover:bg-galaxy-hover"
                              }`}
                              title={`${col.label}: ${isChecked ? "Aktif" : "Non-Aktif"}`}
                            >
                              {isChecked ? "✓" : "—"}
                            </button>
                          </td>
                        );
                      })}

                      {/* Quick Row Toggle */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onToggleRow(menu.menuId, !isAllChecked)}
                          className="text-[11px] font-medium text-primary-400 hover:underline"
                        >
                          {isAllChecked ? "Matikan Baris" : "Nyalakan Semua"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
