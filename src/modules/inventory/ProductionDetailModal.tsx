"use client";

import React from "react";
import { X, Cpu, Calendar, Warehouse, User, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Production } from "@/types";

export interface ProductionDetailModalProps {
  isOpen: boolean;
  production: Production | null;
  onClose: () => void;
}

export function ProductionDetailModal({
  isOpen,
  production,
  onClose,
}: ProductionDetailModalProps) {
  if (!isOpen || !production) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-galaxy-border dark:bg-galaxy-card my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-galaxy-border/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-heading">
                  Detail Dokumen Produksi
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Selesai
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-primary-500">
                {production.productionNumber}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-galaxy-hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-galaxy-border/40 dark:bg-galaxy-input">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Warehouse className="h-3.5 w-3.5" />
                <span>Gudang</span>
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {production.warehouse?.warehouseName || "-"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-galaxy-border/40 dark:bg-galaxy-input">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Tanggal</span>
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {new Date(production.productionDate).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-galaxy-border/40 dark:bg-galaxy-input">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Cpu className="h-3.5 w-3.5" />
                <span>Hasil Jadi</span>
              </div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {Number(production.actualQuantity)} {production.unit?.unitCode || "Porsi"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-galaxy-border/40 dark:bg-galaxy-input">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <User className="h-3.5 w-3.5" />
                <span>Operator</span>
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {production.createdBy || "SYSTEM"}
              </div>
            </div>
          </div>

          {/* Product Output Banner */}
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-4 dark:border-galaxy-border/80 dark:bg-galaxy-card/40 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Produk Jadi Masuk Stok
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {production.product?.productName}
                {production.variant && (
                  <span className="ml-2 font-normal text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {production.variant.variantName}
                  </span>
                )}
              </div>
              <div className="font-mono text-xs text-slate-400">
                {production.product?.productCode}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400">HPP Produksi Satuan</div>
              <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                Rp {Math.round(Number(production.costPerUnit)).toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* Consumed Materials Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-heading">
              Rincian Bahan Baku yang Dikonsumsi
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-galaxy-border/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-galaxy-thead border-b border-slate-200/80 dark:border-galaxy-border/80 text-slate-600 dark:text-slate-300 font-heading">
                  <tr>
                    <th className="w-8 px-3 py-2 text-center">No</th>
                    <th className="px-3 py-2 font-semibold">Bahan Baku</th>
                    <th className="w-28 px-3 py-2 text-right font-semibold">Qty Aktual</th>
                    <th className="w-28 px-3 py-2 text-right font-semibold">HPP Satuan</th>
                    <th className="w-32 px-3 py-2 text-right font-semibold">Subtotal Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40 text-slate-700 dark:text-slate-200">
                  {production.materials?.map((m, idx) => (
                    <tr key={m.materialId} className="hover:bg-slate-50/40">
                      <td className="px-3 py-2 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {m.product?.productName}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {m.product?.productCode}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {Number(m.actualQuantity)} {m.unit?.unitCode || ""}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">
                        Rp {Math.round(Number(m.costPrice)).toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Rp {Math.round(Number(m.subtotalCost)).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/80 dark:bg-galaxy-thead/60 border-t border-slate-200 font-semibold text-xs">
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-right text-slate-600 dark:text-slate-300">
                      Total Biaya Bahan Baku:
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {Math.round(Number(production.totalMaterialCost)).toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {production.notes && (
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs dark:border-galaxy-border/40 dark:bg-galaxy-input">
              <span className="font-semibold text-slate-600 dark:text-slate-300 mr-2">Catatan:</span>
              <span className="text-slate-700 dark:text-slate-300">{production.notes}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
