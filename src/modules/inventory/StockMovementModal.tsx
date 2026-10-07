"use client";

import React, { useEffect, useState } from "react";
import { X, History, ArrowDownLeft, ArrowUpRight, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { inventoryService } from "@/services/inventory.service";
import type { StockItem, StockMovementItem } from "@/types";

export interface StockMovementModalProps {
  isOpen: boolean;
  stockItem: StockItem | null;
  onClose: () => void;
}

export function StockMovementModal({ isOpen, stockItem, onClose }: StockMovementModalProps) {
  const [movements, setMovements] = useState<StockMovementItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && stockItem) {
      setLoading(true);
      inventoryService
        .getMovements({
          warehouseId: stockItem.warehouseId,
          productId: stockItem.productId,
          limit: 50,
        })
        .then((res) => {
          setMovements(res.data || []);
        })
        .catch(() => {
          setMovements([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, stockItem]);

  if (!isOpen || !stockItem) return null;

  const getBadgeType = (type: string) => {
    switch (type) {
      case "IN":
      case "TRANSFER_IN":
      case "VOID_RESTOCK":
        return "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "OUT":
      case "TRANSFER_OUT":
      case "SALE_DEDUCT":
        return "bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400";
      case "ADJUSTMENT":
      default:
        return "bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-xl dark:bg-galaxy-card border border-slate-200/80 dark:border-galaxy-border/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-heading">
                Kartu Stok Mutasi: {stockItem.product.productName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gudang: <span className="font-medium text-slate-700 dark:text-slate-200">{stockItem.warehouse.warehouseName}</span> • Saldo Saat Ini: <span className="font-mono font-semibold text-primary-400">{Number(stockItem.quantity)} {stockItem.product.unit?.unitName || ""}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-galaxy-hover"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
              <p className="mt-2 text-xs text-slate-400">Memuat riwayat mutasi...</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs">Belum ada riwayat mutasi stok tercatat untuk produk ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-galaxy-border/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-galaxy-thead dark:text-slate-400 border-b border-slate-200/80 dark:border-galaxy-border/80 font-heading">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal & Waktu</th>
                    <th className="py-2.5 px-3">Tipe Mutasi</th>
                    <th className="py-2.5 px-3">No Referensi</th>
                    <th className="py-2.5 px-3 text-right">Sebelum</th>
                    <th className="py-2.5 px-3 text-right">Mutasi</th>
                    <th className="py-2.5 px-3 text-right">Saldo Akhir</th>
                    <th className="py-2.5 px-4">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/60">
                  {movements.map((mov) => {
                    const changeQty = Number(mov.quantity);
                    const isPositive = changeQty > 0;

                    return (
                      <tr key={mov.movementId} className="hover:bg-slate-50/60 dark:hover:bg-galaxy-hover/30">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                          {new Date(mov.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium font-mono ${getBadgeType(
                              mov.movementType
                            )}`}
                          >
                            {isPositive ? <ArrowDownLeft className="h-2.5 w-2.5" /> : <ArrowUpRight className="h-2.5 w-2.5" />}
                            {mov.movementType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-200">
                          {mov.referenceNumber || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {Number(mov.balanceBefore).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          <span className={isPositive ? "text-emerald-500" : "text-rose-500"}>
                            {isPositive ? `+${changeQty}` : changeQty}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                          {Number(mov.balanceAfter).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={mov.notes || ""}>
                          {mov.notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200/80 dark:border-galaxy-border/80 px-6 py-3.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
