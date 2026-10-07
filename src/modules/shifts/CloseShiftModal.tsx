"use client";

import React, { useState, useEffect } from "react";
import { X, Lock, AlertTriangle, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { shiftsService } from "@/services";
import type { RegisterShift, ShiftSummary } from "@/types";

export interface CloseShiftModalProps {
  isOpen: boolean;
  shift: RegisterShift | null;
  onClose: () => void;
  onSubmit: (shiftId: string, data: { actualCash: number; closingNotes?: string }) => Promise<void>;
}

export function CloseShiftModal({
  isOpen,
  shift,
  onClose,
  onSubmit,
}: CloseShiftModalProps) {
  const [actualCash, setActualCash] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (isOpen && shift) {
      setActualCash(0);
      setClosingNotes("");
      setSummaryLoading(true);
      shiftsService
        .getSummary(shift.shiftId)
        .then((res) => {
          if (res.data) setSummary(res.data);
        })
        .catch(() => {
          // Fallback gracefully to shift object
          setSummary(null);
        })
        .finally(() => setSummaryLoading(false));
    }
  }, [isOpen, shift]);

  if (!isOpen || !shift) return null;

  const openingCash = Number(summary?.openingCash ?? shift.openingCash ?? 0);
  const expectedCash = Number(summary?.expectedCash ?? shift.expectedCash ?? shift.openingCash ?? 0);
  const totalCashSales = Number(summary?.totalCashSales ?? 0);
  const cashIn = Number(summary?.cashIn ?? 0);
  const cashOut = Number(summary?.cashOut ?? 0);
  const diff = Number(actualCash) - expectedCash;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleUseExpectedCash = () => {
    setActualCash(expectedCash);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(shift.shiftId, {
        actualCash: Number(actualCash),
        closingNotes: closingNotes || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-galaxy-border dark:bg-galaxy-card text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-galaxy-border/80">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-400/10 text-rose-500">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-heading">
                Tutup Sesi Kasir (Close Shift)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {shift.shiftCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-galaxy-hover dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-galaxy-thead border border-slate-200/60 dark:border-galaxy-border/50 space-y-1.5 font-mono">
            {summaryLoading ? (
              <div className="flex items-center justify-center py-2 text-slate-400 gap-2 font-sans text-xs">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memuat kalkulasi kas real-time...</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Modal Awal Laci:</span>
                  <span>{formatCurrency(openingCash)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>(+) Penjualan Tunai:</span>
                  <span>{formatCurrency(totalCashSales)}</span>
                </div>
                {cashIn > 0 && (
                  <div className="flex justify-between text-cyan-600 dark:text-cyan-400">
                    <span>(+) Kas Masuk:</span>
                    <span>{formatCurrency(cashIn)}</span>
                  </div>
                )}
                {cashOut > 0 && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>(-) Kas Keluar:</span>
                    <span>{formatCurrency(cashOut)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-galaxy-border/60 font-semibold text-slate-900 dark:text-slate-100">
                  <span>(=) Estimasi Kas Sistem:</span>
                  <span>{formatCurrency(expectedCash)}</span>
                </div>
              </>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-heading">
                Hitungan Uang Fisik Riil di Laci (Rp) *
              </label>
              <button
                type="button"
                onClick={handleUseExpectedCash}
                disabled={summaryLoading}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                title="Salin nominal estimasi kas sistem ke uang fisik"
              >
                <Sparkles className="h-3 w-3" />
                <span>Isi Sesuai Sistem</span>
              </button>
            </div>
            <input
              type="number"
              min="0"
              required
              value={actualCash || ""}
              onChange={(e) => setActualCash(Number(e.target.value))}
              placeholder="Hitung seluruh uang fisik di laci kas..."
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono font-semibold text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          {/* Variance preview */}
          <div
            className={`p-3 rounded-lg border flex items-center justify-between font-mono text-xs ${
              diff === 0
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                : diff > 0
                ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
                : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
            }`}
          >
            <div className="flex items-center gap-1.5 font-sans font-medium">
              {diff === 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Kas Cocok (Seimbang)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <span>{diff > 0 ? "Kelebihan Uang Fisik" : "Kekurangan Uang Fisik"}</span>
                </>
              )}
            </div>
            <div className="font-bold">
              {diff > 0 ? `+ ${formatCurrency(diff)}` : formatCurrency(diff)}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-heading">
              Catatan Penutupan Kasir (opsional)
            </label>
            <textarea
              rows={2}
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              placeholder="Keterangan setoran kas, selisih, atau brankas..."
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-galaxy-border/80">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              className="shadow-galaxy-cyan"
            >
              {loading ? "Menutup..." : "Konfirmasi Tutup Shift"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
