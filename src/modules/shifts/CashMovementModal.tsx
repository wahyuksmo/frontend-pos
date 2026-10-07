"use client";

import React, { useState } from "react";
import { X, DollarSign, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { RegisterShift } from "@/types";

export interface CashMovementModalProps {
  isOpen: boolean;
  shift: RegisterShift | null;
  onClose: () => void;
  onSubmit: (shiftId: string, data: {
    movementType: "CASH_IN" | "CASH_OUT";
    amount: number;
    reason: string;
    recipient?: string;
    authorizedBy?: string;
  }) => Promise<void>;
}

export function CashMovementModal({
  isOpen,
  shift,
  onClose,
  onSubmit,
}: CashMovementModalProps) {
  const [movementType, setMovementType] = useState<"CASH_IN" | "CASH_OUT">("CASH_OUT");
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [recipient, setRecipient] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !shift) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reason) return;

    setLoading(true);
    try {
      await onSubmit(shift.shiftId, {
        movementType,
        amount: Number(amount),
        reason,
        recipient: recipient || undefined,
        authorizedBy: authorizedBy || undefined,
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-500">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-heading">
                Catat Mutasi Kas Kecil (Petty Cash)
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
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-heading">
              Jenis Mutasi Kas *
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setMovementType("CASH_OUT")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  movementType === "CASH_OUT"
                    ? "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-400"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-galaxy-border dark:text-slate-300 dark:hover:bg-galaxy-hover"
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-rose-500" />
                <span>Kas Keluar (Cash Out)</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType("CASH_IN")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  movementType === "CASH_IN"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-400"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-galaxy-border dark:text-slate-300 dark:hover:bg-galaxy-hover"
                }`}
              >
                <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                <span>Kas Masuk (Cash In)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-heading">
              Nominal Uang (Rp) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Contoh: 50000"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono font-semibold text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-heading">
              Keperluan / Alasan *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Misal: Tambah modal uang receh / beli es batu"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-heading">
                Penerima (opsional)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Kurir / Toko Sebelah"
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-heading">
                Disetujui Oleh
              </label>
              <input
                type="text"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                placeholder="Manager On Duty"
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-galaxy-border/80">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!amount || !reason || loading}
              className="shadow-galaxy-cyan"
            >
              {loading ? "Menyimpan..." : "Simpan Mutasi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
