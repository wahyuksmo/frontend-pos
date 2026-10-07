"use client";

import React from "react";
import { Download, History, Package, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import type { StockItem, PaginationMeta } from "@/types";

export interface InventoryStockTableProps {
  data: StockItem[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewMovement: (item: StockItem) => void;
  onExportCsv?: () => void;
}

export function InventoryStockTable({
  data,
  meta,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewMovement,
  onExportCsv,
}: InventoryStockTableProps) {
  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Daftar Saldo Stok Barang
        </CardTitle>
        {onExportCsv && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="gap-1.5 text-xs font-heading"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {/* Show Entries */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-galaxy-border/60">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Jumlah entri per halaman"
              className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-800 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-400"
            >
              {[10, 25, 50, 100].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
            <span>entri</span>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-galaxy-thead dark:text-slate-400 border-b border-slate-200/80 dark:border-galaxy-border/80 font-heading">
              <tr>
                <th className="py-3 px-5">Gudang</th>
                <th className="py-3 px-4">Kode & Nama Produk</th>
                <th className="py-3 px-4">Satuan</th>
                <th className="py-3 px-4 text-right">Saldo Fisik</th>
                <th className="py-3 px-4 text-right">Min / Max</th>
                <th className="py-3 px-4 text-center">Status Stok</th>
                <th className="py-3 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
                      <span>Memuat saldo stok...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <span>Tidak ada data stok yang ditemukan</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const qty = Number(item.quantity);
                  const min = Number(item.minStock);
                  const isNegative = qty < 0;
                  const isLow = qty <= min && qty >= 0;

                  return (
                    <tr
                      key={item.stockId}
                      className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-medium text-slate-800 dark:text-slate-100">
                        {item.warehouse.warehouseName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-100">
                          {item.product.productName}
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{item.product.productCode}</span>
                          {item.product.sku && <span>• SKU: {item.product.sku}</span>}
                          {item.variant && (
                            <span className="text-primary-400">({item.variant.variantName})</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {item.product.unit?.unitName || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-semibold text-sm ${
                            isNegative
                              ? "text-rose-500"
                              : isLow
                              ? "text-amber-500"
                              : "text-slate-800 dark:text-slate-100"
                          }`}
                        >
                          {qty.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500">
                        {min} / {Number(item.maxStock)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isNegative ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-medium text-rose-600 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                            <AlertCircle className="h-3 w-3" />
                            Stok Minus (Perlu Opname)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onViewMovement(item)}
                          className="h-7 gap-1 px-2.5 text-[11px] hover:border-primary-400 hover:text-primary-400"
                        >
                          <History className="h-3 w-3 text-primary-400" />
                          <span>Kartu Stok</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="border-t border-slate-100 dark:border-galaxy-border/60 px-5 py-3">
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages || 1}
              totalItems={meta.total || 0}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
