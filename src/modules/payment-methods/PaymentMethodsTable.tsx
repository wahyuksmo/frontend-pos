"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, MoreVertical, Edit2, Trash2, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { PaymentMethod, PaginationMeta } from "@/types";

export interface PaymentMethodsTableProps {
  data: PaymentMethod[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: PaymentMethod) => void;
  onDelete: (item: PaymentMethod) => void;
}

export function PaymentMethodsTable({
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
}: PaymentMethodsTableProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<{
    item: PaymentMethod;
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

  const handleToggleMenu = (item: PaymentMethod, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.item.paymentMethodId === item.paymentMethodId) {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 90;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight;
    const top = openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const left = Math.max(10, rect.right - 140);

    setActiveMenu({ item, top, left });
  };

  const total = meta?.total ?? data.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const formatFee = (item: PaymentMethod) => {
    const val = Number(item.feeValue || 0);
    if (!val || item.feeType === "NONE") return "-";
    if (item.feeType === "PERCENTAGE") return `${val}%`;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CASH":
        return "Tunai (Cash)";
      case "EDC_DEBIT":
        return "Debit (EDC)";
      case "EDC_CREDIT":
        return "Kredit (EDC)";
      case "QRIS":
        return "QRIS";
      case "EWALLET":
        return "E-Wallet";
      case "BANK_TRANSFER":
        return "Transfer Bank";
      default:
        return type;
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
            Daftar Metode Pembayaran
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Konfigurasi kanal pembayaran kasir, biaya merchant (MDR/fee), dan no. referensi transaksi
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
            <span>Tambah Metode</span>
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
            <span className="text-slate-500">data per halaman</span>
          </div>
          <div className="text-slate-500">
            Total: <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{total}</span> metode
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-galaxy-thead border-b border-slate-200/80 dark:border-galaxy-border/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300 font-heading uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Kode</th>
                <th className="px-5 py-3.5">Nama Metode</th>
                <th className="px-5 py-3.5">Tipe Pembayaran</th>
                <th className="px-5 py-3.5">Biaya / Fee</th>
                <th className="px-5 py-3.5 text-center">Wajib No. Ref</th>
                <th className="px-5 py-3.5 text-center">Urutan</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <LoadingSpinner size="md" label="Memuat metode pembayaran..." />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CreditCard className="mx-auto h-8 w-8 mb-2 opacity-30 text-slate-400" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Belum ada data metode pembayaran
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik tombol &ldquo;Tambah Metode&rdquo; untuk mengaktifkan kanal bayar baru.
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.paymentMethodId}
                    className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {item.methodCode}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {item.methodName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {getTypeLabel(item.methodType)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {formatFee(item)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.requiresReference === "Y"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20"
                            : "text-slate-400"
                        }`}
                      >
                        {item.requiresReference === "Y" ? "Ya" : "Tidak"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-center text-slate-600 dark:text-slate-300">
                      {item.displayOrder ?? item.sortOrder ?? 0}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          item.isActive === "Y"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        }`}
                      >
                        {item.isActive === "Y" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleToggleMenu(item, e)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Portal Action Menu */}
        {mounted &&
          activeMenu &&
          createPortal(
            <div
              style={{ position: "fixed", top: activeMenu.top, left: activeMenu.left, zIndex: 9999 }}
              className="w-36 bg-white dark:bg-galaxy-card border border-slate-200 dark:border-galaxy-border rounded-lg shadow-xl py-1 text-xs font-heading animate-in fade-in zoom-in-95 duration-100"
            >
              <button
                type="button"
                onClick={() => {
                  const item = activeMenu.item;
                  setActiveMenu(null);
                  onOpenEdit(item);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-galaxy-hover transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5 text-blue-500" />
                <span>Ubah</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = activeMenu.item;
                  setActiveMenu(null);
                  onDelete(item);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </button>
            </div>,
            document.body
          )}

        {/* Bottom Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-galaxy-border/40 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Menampilkan{" "}
            <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{startItem}</span> -{" "}
            <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{endItem}</span> dari{" "}
            <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{total}</span> data
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-7 px-2.5 text-xs"
            >
              Sebelumnya
            </Button>
            <span className="px-2 font-mono">
              Hal {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-7 px-2.5 text-xs"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
