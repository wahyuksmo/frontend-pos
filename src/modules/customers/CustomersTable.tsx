"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, MoreVertical, Edit2, Trash2, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Customer, PaginationMeta } from "@/types";

export interface CustomersTableProps {
  data: Customer[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: Customer) => void;
  onDelete: (item: Customer) => void;
}

export function CustomersTable({
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
}: CustomersTableProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<{
    item: Customer;
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

  const handleToggleMenu = (item: Customer, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.item.customerId === item.customerId) {
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

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
            Daftar Data Pelanggan
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Basis data member, limit kredit transaksi tempo, dan akumulasi poin loyalitas
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
            <span>Tambah Pelanggan</span>
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
            Total: <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{total}</span> pelanggan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-galaxy-thead border-b border-slate-200/80 dark:border-galaxy-border/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300 font-heading uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Kode Pelanggan</th>
                <th className="px-5 py-3.5">Nama Pelanggan</th>
                <th className="px-5 py-3.5">Grup Pelanggan</th>
                <th className="px-5 py-3.5">No. Telepon</th>
                <th className="px-5 py-3.5">Limit Kredit</th>
                <th className="px-5 py-3.5 text-center">Poin Loyalitas</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <LoadingSpinner size="md" label="Memuat data pelanggan..." />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <UserCheck className="mx-auto h-8 w-8 mb-2 opacity-30 text-slate-400" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Belum ada data pelanggan
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik tombol &ldquo;Tambah Pelanggan&rdquo; untuk mendaftarkan member baru.
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.customerId}
                    className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {item.customerCode}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                      <div>{item.customerName}</div>
                      {item.email && (
                        <div className="text-[11px] text-slate-400 font-normal">{item.email}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {item.customerGroup ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.customerGroup.groupName}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {item.phone || "-"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {formatRupiah(item.creditLimit)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-center font-semibold text-emerald-600 dark:text-emerald-400">
                      {Number(item.loyaltyPoints ?? item.points ?? 0)}
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
