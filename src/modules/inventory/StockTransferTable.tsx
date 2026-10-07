"use client";

import React, { useState } from "react";
import { Plus, Eye, ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { inventoryService } from "@/services/inventory.service";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { StockTransferItem, PaginationMeta } from "@/types";

export interface StockTransferTableProps {
  data: StockTransferItem[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreate: () => void;
  onRefresh: () => void;
}

export function StockTransferTable({
  data,
  meta,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onOpenCreate,
  onRefresh,
}: StockTransferTableProps) {
  const [detailItem, setDetailItem] = useState<StockTransferItem | null>(null);

  const handleOpenDetail = async (id: string) => {
    try {
      const res = await inventoryService.getTransferById(id);
      setDetailItem(res.data);
    } catch {
      // ignore
    }
  };

  const handleReceive = async (item: StockTransferItem) => {
    const confirmed = await showConfirmDialog(
      "Konfirmasi Penerimaan",
      `Apakah Anda yakin ingin memproses penerimaan transfer ${item.transferNumber}? Saldo gudang tujuan akan bertambah dan gudang asal akan berkurang.`
    );

    if (confirmed) {
      try {
        await inventoryService.updateTransferStatus(item.transferId, {
          status: "RECEIVED",
          notes: "Diterima oleh petugas gudang",
        });
        showSuccessAlert("Berhasil", "Barang transfer berhasil diterima dan saldo stok telah dimutasi");
        onRefresh();
      } catch (err: any) {
        showErrorAlert("Gagal Menerima", err.message || "Terjadi kesalahan saat menerima transfer");
      }
    }
  };

  return (
    <>
      <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
        <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
            Riwayat Transfer Antar Gudang
          </CardTitle>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenCreate}
            className="gap-1.5 shadow-galaxy-cyan"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Transfer Baru</span>
          </Button>
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
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-800 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 focus:outline-none"
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
              <thead className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-galaxy-thead dark:text-slate-400 border-b border-slate-200/80 dark:border-galaxy-border/80 font-heading">
                <tr>
                  <th className="py-3 px-5">No Dokumen</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Dari Gudang</th>
                  <th className="py-3 px-4">Tujuan Gudang</th>
                  <th className="py-3 px-4 text-center">Item</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
                        <span>Memuat data transfer...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ArrowLeftRight className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <span>Belum ada dokumen transfer stok</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr
                      key={item.transferId}
                      className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono font-medium text-primary-400">
                        {item.transferNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-100">
                        {item.fromWarehouse.warehouseName}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-100">
                        {item.toWarehouse.warehouseName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold">
                        {item._count?.items || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${
                            item.status === "RECEIVED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : item.status === "PENDING"
                              ? "bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-galaxy-input dark:text-slate-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetail(item.transferId)}
                            className="h-7 gap-1 px-2 text-[11px]"
                          >
                            <Eye className="h-3 w-3 text-primary-400" />
                            <span>Lihat</span>
                          </Button>
                          {item.status !== "RECEIVED" && item.status !== "CANCELLED" && (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => handleReceive(item)}
                              className="h-7 gap-1 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Terima</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
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

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-xl dark:bg-galaxy-card border border-slate-200/80 dark:border-galaxy-border/80 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border/80 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-heading">
                  Detail Dokumen Transfer: {detailItem.transferNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Dari: {detailItem.fromWarehouse.warehouseName} ➔ Ke: {detailItem.toWarehouse.warehouseName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-galaxy-thead font-heading">
                  <tr>
                    <th className="py-2 px-3">Produk</th>
                    <th className="py-2 px-3 text-right">Jumlah Transfer</th>
                    <th className="py-2 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/60">
                  {detailItem.items?.map((row) => (
                    <tr key={row.transferItemId}>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800 dark:text-slate-100">
                          {row.product.productName}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {row.product.productCode}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-primary-400">
                        {Number(row.quantity)} {row.product.unit?.unitName || ""}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{row.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end border-t border-slate-200/80 dark:border-galaxy-border/80 px-6 py-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setDetailItem(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
