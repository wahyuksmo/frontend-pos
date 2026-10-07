"use client";

import React from "react";
import { Sliders, Key, Calendar, User, Tag, FileText, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SystemSetting } from "@/types";

export interface SettingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  setting: SystemSetting | null;
}

export function SettingDetailModal({
  isOpen,
  onClose,
  setting,
}: SettingDetailModalProps) {
  if (!setting) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Pengaturan Sistem"
      description="Informasi spesifikasi lengkap parameter konfigurasi."
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
            <Sliders className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono truncate">
              {setting.settingKey}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {setting.description || "Tidak ada deskripsi"}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="info" className="text-[10px] uppercase font-mono">
                Tipe: {setting.valueType || "string"}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {setting.objectCode || "SETTING"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Setting Value Card */}
        <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Key className="h-3.5 w-3.5 text-primary-400" />
            <span>Nilai Konfigurasi (Setting Value)</span>
          </div>
          <pre className="rounded bg-slate-100 dark:bg-galaxy-input p-3 text-xs font-mono text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-all overflow-x-auto max-h-40">
            {setting.settingValue}
          </pre>
        </div>

        {/* Detailed Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Dibuat Oleh */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <User className="h-3.5 w-3.5 text-primary-400" />
              <span>Dibuat Oleh</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {setting.createdBy || "SYSTEM"}
            </p>
          </div>

          {/* Diperbarui Oleh */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <User className="h-3.5 w-3.5 text-primary-400" />
              <span>Terakhir Diubah Oleh</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {setting.updatedBy || "-"}
            </p>
          </div>

          {/* Tanggal Pembuatan */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Calendar className="h-3.5 w-3.5 text-primary-400" />
              <span>Waktu Pembuatan</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {setting.createdAt
                ? new Date(setting.createdAt).toLocaleString("id-ID")
                : "-"}
            </p>
          </div>

          {/* Terakhir Diperbarui */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Calendar className="h-3.5 w-3.5 text-primary-400" />
              <span>Waktu Pembaruan Terakhir</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {setting.updatedAt
                ? new Date(setting.updatedAt).toLocaleString("id-ID")
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
