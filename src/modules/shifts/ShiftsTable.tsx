"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  MoreVertical,
  Clock,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Lock,
  Unlock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { RegisterShift, PaginationMeta } from "@/types";

export interface ShiftsTableProps {
  data: RegisterShift[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreate: () => void;
  onOpenCloseShift: (shift: RegisterShift) => void;
  onOpenCashMovement: (shift: RegisterShift) => void;
}

export function ShiftsTable({
  data,
  meta,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onOpenCreate,
  onOpenCloseShift,
  onOpenCashMovement,
}: ShiftsTableProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<{
    item: RegisterShift;
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

  const handleToggleMenu = (item: RegisterShift, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.item.shiftId === item.shiftId) {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 100;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight;
    const top = openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const left = Math.max(10, rect.right - 180);

    setActiveMenu({ item, top, left });
  };

  const formatCurrency = (val?: number | string | null) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const total = meta?.total ?? data.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
            Daftar Sesi Kasir (Cashier Shifts)
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log sesi buka/tutup kasir, modal laci kas awal, dan selisih rekonsiliasi kas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenCreate}
            className="gap-1.5 shadow-galaxy-cyan"
          >
            <Plus className="h-4 w-4" />
            <span>Buka Shift Baru</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-galaxy-border/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded border border-slate-300 dark:border-galaxy-border bg-white dark:bg-galaxy-input px-2 text-xs font-mono focus:outline-none focus:border-primary-400"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-slate-500">entri</span>
          </div>
          <div className="text-slate-500 font-mono">
            Total {total} sesi shift
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-galaxy-border/80 bg-slate-50/70 dark:bg-galaxy-thead text-slate-700 dark:text-slate-200 font-heading">
                <th className="px-4 py-3 font-semibold">Kode Shift</th>
                <th className="px-4 py-3 font-semibold">Cabang & Kasir</th>
                <th className="px-4 py-3 font-semibold">Waktu Buka / Tutup</th>
                <th className="px-4 py-3 font-semibold text-right">Modal Awal</th>
                <th className="px-4 py-3 font-semibold text-right">Total Sales</th>
                <th className="px-4 py-3 font-semibold text-right">Kas Fisik Riil</th>
                <th className="px-4 py-3 font-semibold text-right">Selisih</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <LoadingSpinner className="mx-auto h-7 w-7 text-primary-400" />
                    <p className="mt-2 text-xs text-slate-500">Memuat data sesi kasir...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Clock className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-1" />
                    <p>Belum ada riwayat sesi kasir.</p>
                  </td>
                </tr>
              ) : (
                data.map((shift) => {
                  const diff = shift.cashDifference !== null ? Number(shift.cashDifference) : null;
                  return (
                    <tr
                      key={shift.shiftId}
                      className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-primary-500 dark:text-primary-400">
                        {shift.shiftCode}
                        <div className="text-[11px] text-slate-500 font-sans font-normal">
                          Register: {shift.register?.registerName || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {shift.outlet?.outletName || "-"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Kasir: {shift.cashierUser?.fullname || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Unlock className="h-3 w-3 text-emerald-500" /> {formatDate(shift.openedAt)}
                        </div>
                        {shift.closedAt ? (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Lock className="h-3 w-3 text-rose-500" /> {formatDate(shift.closedAt)}
                          </div>
                        ) : (
                          <div className="text-[11px] text-amber-500 font-medium">Masih Berjalan</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {formatCurrency(shift.openingCash)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                        {formatCurrency(shift.totalSalesAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(shift.actualCash)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        {diff === null ? (
                          <span className="text-slate-400">-</span>
                        ) : diff === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">Pas (Rp 0)</span>
                        ) : diff > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            + {formatCurrency(diff)}
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400">
                            {formatCurrency(diff)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {shift.status === "OPEN" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                            Buka (Open)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                            Tutup (Closed)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleMenu(shift, e)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-300 dark:hover:bg-galaxy-hover"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-galaxy-border/40 text-xs">
          <div className="text-slate-500 font-mono">
            Menampilkan {startItem} sampai {endItem} dari {total} entri
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 px-3 text-xs"
            >
              Sebelumnya
            </Button>
            <span className="px-2 text-slate-600 dark:text-slate-300 font-mono">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 px-3 text-xs"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Floating Action Menu Portal */}
      {mounted &&
        activeMenu &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: `${activeMenu.top}px`,
              left: `${activeMenu.left}px`,
              zIndex: 9999,
            }}
            className="w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-galaxy-border dark:bg-galaxy-card text-xs font-heading animate-in fade-in zoom-in-95 duration-100"
          >
            {activeMenu.item.status === "OPEN" ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const item = activeMenu.item;
                    setActiveMenu(null);
                    onOpenCashMovement(item);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-galaxy-hover"
                >
                  <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                  <span>Petty Cash In / Out</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = activeMenu.item;
                    setActiveMenu(null);
                    onOpenCloseShift(item);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Tutup Sesi (Close Shift)</span>
                </button>
              </>
            ) : (
              <div className="px-2.5 py-1.5 text-slate-400 italic">
                Sesi sudah ditutup
              </div>
            )}
          </div>,
          document.body,
        )}
    </Card>
  );
}
