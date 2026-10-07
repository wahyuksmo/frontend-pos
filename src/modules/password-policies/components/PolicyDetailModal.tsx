"use client";

import React from "react";
import { KeyRound, Shield, CheckCircle2, XCircle, Sliders, Calendar } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { PasswordPolicy } from "@/types";

export interface PolicyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: PasswordPolicy | null;
}

export function PolicyDetailModal({ isOpen, onClose, policy }: PolicyDetailModalProps) {
  if (!policy) return null;

  const isActive = policy.value !== "0" && policy.value !== "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Kebijakan Kata Sandi"
      description="Parameter aturan keamanan password yang diterapkan pada sistem."
      maxWidth="2xl"
      footer={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          Tutup
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Hero Card */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-galaxy-border/80 dark:bg-galaxy-thead/60">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-400/20 text-primary-400 font-bold text-base ring-4 ring-primary-400/20">
            <KeyRound className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-heading truncate">
              {policy.code}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Nilai Konfigurasi: <strong className="text-primary-400 font-mono text-sm">{policy.value}</strong>
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant={isActive ? "success" : "danger"} className="text-[10px]">
                {isActive ? "Kebijakan Aktif" : "Non-Aktif"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Sliders className="h-3.5 w-3.5 text-primary-400" />
              <span>Nilai Parameter (Value)</span>
            </div>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
              {policy.value}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Calendar className="h-3.5 w-3.5 text-primary-400" />
              <span>Terakhir Diperbarui</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {policy.updatedAt ? new Date(policy.updatedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }) : "-"}
            </p>
          </div>

          <div className="sm:col-span-2 rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Shield className="h-3.5 w-3.5 text-primary-400" />
              <span>Pesan Kesalahan / Panduan Pengguna</span>
            </div>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {policy.message}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
