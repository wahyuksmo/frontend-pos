"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { SelectOption } from "@/types";

export interface OpenShiftModalProps {
  isOpen: boolean;
  outletOptions: SelectOption[];
  registerOptions: SelectOption[];
  onClose: () => void;
  onSubmit: (data: { outletId: string; registerId: string; openingCash: number }) => Promise<void>;
}

export function OpenShiftModal({
  isOpen,
  outletOptions,
  registerOptions,
  onClose,
  onSubmit,
}: OpenShiftModalProps) {
  const [outletId, setOutletId] = useState("");
  const [registerId, setRegisterId] = useState("");
  const [openingCash, setOpeningCash] = useState<number>(200000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (outletOptions.length > 0 && !outletId) {
      setOutletId(outletOptions[0].value);
    }
  }, [outletOptions, outletId]);

  useEffect(() => {
    if (registerOptions.length > 0 && !registerId) {
      setRegisterId(registerOptions[0].value);
    }
  }, [registerOptions, registerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletId || !registerId) return;

    setLoading(true);
    try {
      await onSubmit({
        outletId,
        registerId,
        openingCash: Number(openingCash || 0),
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
              <Unlock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-heading">
                Buka Sesi Kasir Baru (Open Shift)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mulai pencatatan transaksi untuk terminal kasir
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
              Cabang Outlet *
            </label>
            <SearchableSelect
              size="sm"
              options={outletOptions}
              value={outletId}
              onChange={setOutletId}
              placeholder="Pilih Outlet..."
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-heading">
              Terminal Kasir (Register) *
            </label>
            <SearchableSelect
              size="sm"
              options={registerOptions}
              value={registerId}
              onChange={setRegisterId}
              placeholder="Pilih Register..."
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-heading">
              Modal Awal Uang Tunai di Laci Kasir (Rp) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={openingCash}
              onChange={(e) => setOpeningCash(Number(e.target.value))}
              placeholder="Contoh: 250000"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Nominal uang kembalian yang disiapkan di awal shift.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-galaxy-border/80">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!outletId || !registerId || loading}
              className="shadow-galaxy-cyan"
            >
              {loading ? "Membuka..." : "Buka Sesi Kasir"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
