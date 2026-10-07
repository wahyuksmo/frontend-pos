"use client";

import React from "react";
import { Eye, Plus, Cpu, Calendar, Warehouse, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Production, PaginationMeta } from "@/types";

export interface ProductionTableProps {
  data: Production[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreate: () => void;
  onViewDetail: (item: Production) => void;
}

export function ProductionTable({
  data,
  meta,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onOpenCreate,
  onViewDetail,
}: ProductionTableProps) {
  const totalPages = meta?.totalPages || 1;
  const total = meta?.total || 0;
  const startEntry = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, total);

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-500" />
          <span>Daftar Riwayat Produksi Olahan (BOM Work Orders)</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreate}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-galaxy-cyan"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Eksekusi Produksi Baru</span>
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
                <th className="px-5 py-3 font-semibold">No. Dokumen & Tgl</th>
                <th className="px-5 py-3 font-semibold">Gudang / Dapur</th>
                <th className="px-5 py-3 font-semibold">Produk Olahan Jadi</th>
                <th className="px-5 py-3 font-semibold text-center">Hasil Jadi Masuk</th>
                <th className="px-5 py-3 font-semibold text-right">Total Biaya Bahan</th>
                <th className="px-5 py-3 font-semibold text-right">HPP / Porsi</th>
                <th className="px-5 py-3 font-semibold text-center">Status</th>
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
                    Belum ada riwayat proses produksi olahan.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.productionId}
                    className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-mono font-bold text-primary-500">
                        {item.productionNumber}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(item.productionDate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <Warehouse className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.warehouse?.warehouseName || "-"}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.product?.productName}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.product?.productCode}
                        </span>
                        {item.variant && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400">
                            {item.variant.variantName}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400">
                        +{Number(item.actualQuantity)} {item.unit?.unitCode || "Porsi"}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                      Rp {Math.round(Number(item.totalMaterialCost)).toLocaleString("id-ID")}
                    </td>

                    <td className="px-5 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {Math.round(Number(item.costPerUnit)).toLocaleString("id-ID")}
                    </td>

                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Selesai
                      </span>
                    </td>

                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/20"
                        onClick={() => onViewDetail(item)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>Detail</span>
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
            Menampilkan {startEntry} sampai {endEntry} dari {total} dokumen produksi
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
