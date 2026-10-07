"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, MoreVertical, Edit2, Trash2, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Category, PaginationMeta } from "@/types";

export interface CategoriesTableProps {
  data: Category[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: Category) => void;
  onDelete: (item: Category) => void;
}

export function CategoriesTable({
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
}: CategoriesTableProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<{
    item: Category;
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

  const handleToggleMenu = (item: Category, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.item.categoryId === item.categoryId) {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 90;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight;
    const top = openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const left = Math.max(10, rect.right - 160);

    setActiveMenu({ item, top, left });
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
            Daftar Kategori Produk
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hierarki kategori makanan, minuman, barang ritel, dan layanan
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
            <span>Tambah Kategori</span>
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
          <div className="text-slate-500">
            Total: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{total}</span> data
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-galaxy-thead font-heading text-slate-700 dark:text-slate-200 border-b border-slate-200/80 dark:border-galaxy-border/80">
              <tr>
                <th className="px-5 py-3 w-12 text-center">No</th>
                <th className="px-5 py-3">Kode Kategori</th>
                <th className="px-5 py-3">Nama Kategori</th>
                <th className="px-5 py-3">Induk Kategori</th>
                <th className="px-5 py-3 text-center">Urutan</th>
                <th className="px-5 py-3 text-center">Jml Produk</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center">
                    <LoadingSpinner className="mx-auto h-6 w-6 text-primary-400" />
                    <span className="mt-2 block text-xs text-slate-400">Memuat data kategori...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    <Layers className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    Belum ada data kategori.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr
                    key={item.categoryId}
                    className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-center font-mono text-slate-500">
                      {startItem + idx}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {item.categoryCode}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      {item.color && (
                        <span
                          className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span>{item.categoryName}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {item.parentCategory?.categoryName || "- (Root)"}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-slate-700 dark:text-slate-300">
                      {item.displayOrder}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-slate-700 dark:text-slate-300">
                      {item._count?.products ?? 0}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {item.isActive === "Y" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleToggleMenu(item, e)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-galaxy-hover text-slate-500 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-galaxy-border/40 gap-3 text-xs">
          <div className="text-slate-500">
            Menampilkan <span className="font-mono font-medium">{startItem}</span> sampai{" "}
            <span className="font-mono font-medium">{endItem}</span> dari{" "}
            <span className="font-mono font-medium">{total}</span> entri
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 font-medium transition-colors"
            >
              Prev
            </button>
            <span className="px-2 font-mono font-medium text-slate-700 dark:text-slate-300">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 font-medium transition-colors"
            >
              Next
            </button>
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
            onClick={(e) => e.stopPropagation()}
            className="w-40 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-2xl backdrop-blur-md dark:border-galaxy-border dark:bg-galaxy-card/95 animate-in fade-in-50 zoom-in-95"
          >
            <button
              type="button"
              onClick={() => {
                const item = activeMenu.item;
                setActiveMenu(null);
                onOpenEdit(item);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30 transition-colors rounded-lg text-left"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Kategori</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const item = activeMenu.item;
                setActiveMenu(null);
                onDelete(item);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors rounded-lg text-left"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Kategori</span>
            </button>
          </div>,
          document.body
        )}
    </Card>
  );
}
