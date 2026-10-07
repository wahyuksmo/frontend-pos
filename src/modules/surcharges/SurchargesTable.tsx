"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, MoreVertical, Edit2, Trash2, Receipt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Surcharge, PaginationMeta } from "@/types";

export interface SurchargesTableProps {
  data: Surcharge[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: Surcharge) => void;
  onDelete: (item: Surcharge) => void;
}

export function SurchargesTable({
  data,
  meta,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onOpenCreate,
  onOpenEdit,
  onDelete,
}: SurchargesTableProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<{
    item: Surcharge;
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleToggleMenu = (item: Surcharge, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.item.surchargeId === item.surchargeId) {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 140;
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    setActiveMenu({
      item,
      top: rect.bottom + window.scrollY + 4,
      left: left + window.scrollX,
    });
  };

  const totalPages = meta?.totalPages || 1;
  const total = meta?.total || 0;
  const startEntry = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, total);

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary-400" />
          <span>Daftar Surcharge & Biaya Layanan</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreate}
            className="gap-1.5 shadow-galaxy-cyan"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Surcharge</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-galaxy-border/40 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-800 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-200"
            >
              {[10, 25, 50, 100].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
            <span>data per halaman</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-galaxy-thead border-b border-slate-200/80 dark:border-galaxy-border/80 text-slate-600 dark:text-slate-300 font-heading">
              <tr>
                <th className="px-5 py-3 font-semibold">Kode</th>
                <th className="px-5 py-3 font-semibold">Nama Biaya</th>
                <th className="px-5 py-3 font-semibold">Outlet</th>
                <th className="px-5 py-3 font-semibold">Tipe & Nilai</th>
                <th className="px-5 py-3 font-semibold">Tipe Order</th>
                <th className="px-5 py-3 font-semibold">Kena Pajak</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40 text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    Belum ada data surcharge.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.surchargeId}
                    className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono font-medium text-primary-400">
                      {item.surchargeCode}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {item.surchargeName}
                    </td>
                    <td className="px-5 py-3">
                      {item.outlet?.outletName || "Semua Outlet (Global)"}
                    </td>
                    <td className="px-5 py-3 font-mono">
                      {item.surchargeType === "PERCENTAGE"
                        ? `${Number(item.rateValue)}%`
                        : `Rp ${Number(item.rateValue).toLocaleString("id-ID")}`}
                    </td>
                    <td className="px-5 py-3 font-mono">
                      {item.applicableOrderType}
                    </td>
                    <td className="px-5 py-3">
                      {item.isTaxable === "Y" ? (
                        <span className="text-amber-500 font-medium">Ya (PB1)</span>
                      ) : (
                        <span className="text-slate-400">Tidak</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {item.isActive === "Y" ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => handleToggleMenu(item, e)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 border-t border-slate-100 dark:border-galaxy-border/40 text-xs text-slate-500">
          <div>
            Menampilkan {startEntry} sampai {endEntry} dari {total} entri
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              Sebelumnya
            </Button>
            <span className="px-2">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Floating Action Portal */}
      {mounted &&
        activeMenu &&
        createPortal(
          <div
            style={{ top: activeMenu.top, left: activeMenu.left }}
            className="fixed z-50 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-galaxy-border dark:bg-galaxy-card text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                const it = activeMenu.item;
                setActiveMenu(null);
                onOpenEdit(it);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-galaxy-hover"
            >
              <Edit2 className="h-3.5 w-3.5 text-primary-400" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                const it = activeMenu.item;
                setActiveMenu(null);
                onDelete(it);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus</span>
            </button>
          </div>,
          document.body
        )}
    </Card>
  );
}
