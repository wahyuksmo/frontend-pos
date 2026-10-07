"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Download,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { SystemSetting, PaginationMeta } from "@/types";

export interface SettingTableProps {
  settings: SystemSetting[];
  loading: boolean;
  meta?: PaginationMeta;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewDetail: (setting: SystemSetting) => void;
  onEdit: (setting: SystemSetting) => void;
  onDelete: (setting: SystemSetting) => void;
  onOpenCreate?: () => void;
  onExport?: () => void;
}

export function SettingTable({
  settings,
  loading,
  meta,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onEdit,
  onDelete,
  onOpenCreate,
  onExport,
}: SettingTableProps) {
  const total = meta?.total ?? settings.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Floating Dropdown state
  const [activeMenu, setActiveMenu] = useState<{
    setting: SystemSetting;
    top: number;
    left: number;
    openUp: boolean;
  } | null>(null);

  const handleToggleMenu = (setting: SystemSetting, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.setting.settingId === setting.settingId) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 130;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight;

    const top = openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const left = Math.max(10, rect.right - 176);

    setActiveMenu({
      setting,
      top,
      left,
      openUp,
    });
  };

  useEffect(() => {
    if (!activeMenu) return;

    const handleClose = () => setActiveMenu(null);
    window.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);

    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [activeMenu]);

  // Generate pagination numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const getValueTypeBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "json":
        return "warning";
      case "number":
        return "info";
      case "boolean":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm relative">
      {/* Card Header: Title on Left, Tambah & Export on Right */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/80 px-6 py-3.5 dark:border-galaxy-border/80">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Daftar Pengaturan Sistem
        </CardTitle>

        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </Button>
          )}

          {onOpenCreate && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onOpenCreate}
              className="gap-1.5 shadow-galaxy-cyan"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Setting</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Top Control: Show entries */}
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-primary-400 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : settings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-galaxy-input text-slate-400 mb-3">
              <Sliders className="h-7 w-7" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Tidak Ada Data Pengaturan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Belum ada pengaturan sistem yang terdaftar atau sesuai kriteria filter saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-50/50 dark:bg-galaxy-thead border-y border-slate-200 dark:border-galaxy-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-center w-12">No</th>
                  <th className="py-3 px-4">Setting Key</th>
                  <th className="py-3 px-4">Nilai Setting</th>
                  <th className="py-3 px-4 text-center">Tipe</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-center">Object Code</th>
                  <th className="py-3 px-4">Terakhir Diubah</th>
                  <th className="py-3 px-6 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/60">
                {settings.map((item, index) => {
                  const isCurrentActive = activeMenu?.setting.settingId === item.settingId;
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={item.settingId}
                      className="border-b border-slate-100 dark:border-galaxy-border/60 hover:bg-slate-50/50 dark:hover:bg-galaxy-hover/40 transition-colors text-xs text-slate-700 dark:text-slate-300"
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {rowNumber}
                      </td>

                      {/* Setting Key */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-primary-400">
                        {item.settingKey}
                      </td>

                      {/* Setting Value */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <code className="rounded bg-slate-100 dark:bg-galaxy-input px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 font-mono truncate block">
                          {item.settingValue}
                        </code>
                      </td>

                      {/* Tipe */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={getValueTypeBadgeVariant(item.valueType)}
                          className="px-2 py-0.5 text-[10px] uppercase font-mono"
                        >
                          {item.valueType || "string"}
                        </Badge>
                      </td>

                      {/* Deskripsi */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-sm truncate">
                        {item.description || "-"}
                      </td>

                      {/* Object Code */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {item.objectCode || "SETTING"}
                        </span>
                      </td>

                      {/* Terakhir Diubah */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>

                      {/* Aksi Button */}
                      <td className="py-3.5 px-6 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleMenu(item, e)}
                          className={`inline-flex h-7 w-8 items-center justify-center rounded border transition-all text-xs font-bold select-none ${
                            isCurrentActive
                              ? "border-primary-400 bg-primary-400/15 text-primary-400 shadow-sm"
                              : "border-slate-200 bg-slate-100/70 hover:bg-slate-200/80 text-slate-700 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-300 dark:hover:bg-galaxy-hover"
                          }`}
                          title="Menu Aksi"
                        >
                          ...
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer: Showing text on Left, Pagination on Right */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-slate-200/80 dark:border-galaxy-border/80 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing {startItem} to {endItem} of {total} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 font-medium transition-colors"
            >
              Previous
            </button>

            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-slate-400 select-none">
                    ...
                  </span>
                );
              }

              const pageNum = Number(p);
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`flex h-8 min-w-[32px] items-center justify-center px-2 rounded text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary-400 text-slate-950 font-bold shadow-sm shadow-primary-400/30"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 dark:hover:bg-galaxy-hover"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>

      {/* Floating Action Menu */}
      {activeMenu && (
        <div
          style={{
            position: "fixed",
            top: `${activeMenu.top}px`,
            left: `${activeMenu.left}px`,
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-44 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-2xl backdrop-blur-md dark:border-galaxy-border dark:bg-galaxy-card/95 animate-in fade-in-50 zoom-in-95"
        >
          <button
            type="button"
            onClick={() => {
              const item = activeMenu.setting;
              setActiveMenu(null);
              onViewDetail(item);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-galaxy-hover transition-colors rounded-lg text-left"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>Lihat Detail</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const item = activeMenu.setting;
              setActiveMenu(null);
              onEdit(item);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30 transition-colors rounded-lg text-left"
          >
            <Edit2 className="h-3.5 w-3.5 text-sky-500" />
            <span>Edit Data</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-galaxy-border/60" />

          <button
            type="button"
            onClick={() => {
              const item = activeMenu.setting;
              setActiveMenu(null);
              onDelete(item);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors rounded-lg text-left"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            <span>Hapus Setting</span>
          </button>
        </div>
      )}
    </Card>
  );
}
