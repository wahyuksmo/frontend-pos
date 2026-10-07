"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Utensils, Layers, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { RecipeGrouped, PaginationMeta } from "@/types";

export interface RecipesTableProps {
  data: RecipeGrouped[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: RecipeGrouped) => void;
  onDelete: (item: RecipeGrouped) => void;
}

export function RecipesTable({
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
}: RecipesTableProps) {
  const totalPages = meta?.totalPages || 1;
  const total = meta?.total || 0;
  const startEntry = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, total);

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
          <Utensils className="h-4 w-4 text-primary-400" />
          <span>Daftar Resep & BOM Menu Olahan (Master-Detail)</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreate}
            className="gap-1.5 shadow-galaxy-cyan"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Resep Menu</span>
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
            <span>menu resep per halaman</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-galaxy-thead border-b border-slate-200/80 dark:border-galaxy-border/80 text-slate-600 dark:text-slate-300 font-heading">
              <tr>
                <th className="px-5 py-3 font-semibold">Produk Menu Jadi</th>
                <th className="px-5 py-3 font-semibold">Varian Spesifik</th>
                <th className="px-5 py-3 font-semibold">Rincian Komposisi Bahan (BOM)</th>
                <th className="px-5 py-3 font-semibold text-center">Jumlah Bahan</th>
                <th className="px-5 py-3 font-semibold text-right">Estimasi Total HPP</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40 text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Belum ada menu dengan resep olahan (BOM).
                  </td>
                </tr>
              ) : (
                data.map((group) => {
                  const previewItems = group.items.slice(0, 3);
                  const remainingCount = group.items.length - previewItems.length;

                  return (
                    <tr
                      key={group.groupKey}
                      className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">
                            <Utensils className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {group.product?.productName || "Menu Tidak Diketahui"}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">
                              {group.product?.productCode || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        {group.variant ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400">
                            <Layers className="h-3 w-3" />
                            {group.variant.variantName}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            Semua Varian (Global)
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3 max-w-xs">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {previewItems.map((ing) => (
                            <span
                              key={ing.recipeId}
                              className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-galaxy-input dark:text-slate-300"
                            >
                              <Package className="h-2.5 w-2.5 text-emerald-500" />
                              <span>{ing.ingredientProduct?.productName}</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                ({Number(ing.quantity)} {ing.unit?.unitCode || ""})
                              </span>
                            </span>
                          ))}
                          {remainingCount > 0 && (
                            <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                              +{remainingCount} lainnya
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-800 dark:bg-galaxy-input dark:text-slate-200">
                          {group.totalItems} Bahan
                        </span>
                      </td>

                      <td className="px-5 py-3 text-right font-mono font-semibold text-primary-600 dark:text-primary-400">
                        Rp {Math.round(group.totalEstimatedCost).toLocaleString("id-ID")}
                      </td>

                      <td className="px-5 py-3">
                        {group.isActive === "Y" ? (
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/20"
                            onClick={() => onOpenEdit(group)}
                            title="Edit Komposisi Resep"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                            <span>Edit BOM</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            onClick={() => onDelete(group)}
                            title="Hapus Seluruh Resep Menu"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 border-t border-slate-100 dark:border-galaxy-border/40 text-xs text-slate-500">
          <div>
            Menampilkan {startEntry} sampai {endEntry} dari {total} menu resep
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
    </Card>
  );
}
