"use client";

import React from "react";
import { Download, QrCode, Calendar, HardDrive, Smartphone, CheckCircle, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AppRelease } from "@/types";

export interface AppReleaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: AppRelease | null;
  onOpenQr: (release: AppRelease) => void;
}

export function AppReleaseDetailModal({
  isOpen,
  onClose,
  release,
  onOpenQr,
}: AppReleaseDetailModalProps) {
  if (!release) return null;

  const downloadUrl =
    release.downloadUrl ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:7780/api/v1/app-releases/${release.releaseId}/download`
      : `/api/v1/app-releases/${release.releaseId}/download`);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Rilis APK v${release.versionName}`}
      description="Informasi teknis dan riwayat build aplikasi kasir Android."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Status Highlights */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-galaxy-input rounded-xl border border-slate-200 dark:border-galaxy-border">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              v{release.versionName}
            </span>
          </div>

          <Badge variant="outline" className="text-xs">
            Build #{release.versionCode}
          </Badge>

          {release.isLatest === "Y" && (
            <Badge variant="success" className="text-xs">
              Rilis Utama
            </Badge>
          )}

          {release.isActive === "Y" ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium ml-auto">
              <CheckCircle className="w-3.5 h-3.5" />
              Aktif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-medium ml-auto">
              <XCircle className="w-3.5 h-3.5" />
              Nonaktif
            </span>
          )}
        </div>

        {/* Technical Specs */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-galaxy-card border border-slate-100 dark:border-galaxy-border rounded-lg space-y-1">
            <span className="text-slate-400 text-[11px] block">Ukuran File</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>{release.fileSizeFormatted}</span>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-galaxy-card border border-slate-100 dark:border-galaxy-border rounded-lg space-y-1">
            <span className="text-slate-400 text-[11px] block">Total Diunduh</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <Download className="w-3.5 h-3.5 text-primary-500" />
              <span>{release.downloadCount} kali</span>
            </div>
          </div>
        </div>

        {/* File & Storage Details */}
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-slate-400 text-[11px]">Nama Berkas Tersimpan</span>
            <p className="font-mono text-slate-700 dark:text-slate-300 break-all bg-slate-50 dark:bg-galaxy-input p-2 rounded border border-slate-200 dark:border-galaxy-border mt-0.5">
              {release.fileName}
            </p>
          </div>

          <div>
            <span className="text-slate-400 text-[11px]">Nama Berkas Asli</span>
            <p className="font-mono text-slate-600 dark:text-slate-400 mt-0.5">
              {release.originalName}
            </p>
          </div>

          {release.releaseNotes && (
            <div>
              <span className="text-slate-400 text-[11px]">Catatan Rilis / Changelog</span>
              <p className="text-slate-700 dark:text-slate-200 whitespace-pre-line bg-slate-50 dark:bg-galaxy-input p-2.5 rounded border border-slate-200 dark:border-galaxy-border mt-0.5">
                {release.releaseNotes}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-galaxy-border/60">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Diunggah: {new Date(release.createdAt).toLocaleString("id-ID")}</span>
            </div>
            {release.createdBy && <span>Oleh: {release.createdBy}</span>}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-galaxy-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenQr(release);
            }}
            className="gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
            <a
              href={downloadUrl}
              download={`POS-v${release.versionName}.apk`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="button" variant="primary" size="sm" className="gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File APK</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
