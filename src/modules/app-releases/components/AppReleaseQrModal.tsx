"use client";

import React, { useState } from "react";
import { Download, Copy, Check, QrCode, Smartphone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AppRelease } from "@/types";

export interface AppReleaseQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: AppRelease | null;
  qrCodeDataUrl?: string;
  downloadUrl?: string;
}

export function AppReleaseQrModal({
  isOpen,
  onClose,
  release,
  qrCodeDataUrl,
  downloadUrl,
}: AppReleaseQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!release) return null;

  const resolvedDownloadUrl =
    downloadUrl ||
    release.downloadUrl ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:7780/api/v1/app-releases/${release.releaseId}/download`
      : `/api/v1/app-releases/${release.releaseId}/download`);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(resolvedDownloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download APK Kasir"
      description={`Scan QR Code atau gunakan tautan untuk mengunduh APK versi ${release.versionName}`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center justify-center p-2 space-y-4">
        {/* Release Summary Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="primary" className="font-semibold text-xs px-2.5 py-1">
            Versi {release.versionName}
          </Badge>
          <Badge variant="outline" className="text-xs px-2.5 py-1">
            Build #{release.versionCode}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {release.fileSizeFormatted}
          </span>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt={`QR Code APK v${release.versionName}`}
              className="w-56 h-56 object-contain"
            />
          ) : (
            <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg">
              <QrCode className="w-16 h-16 stroke-1 mb-2" />
              <span className="text-xs">Memuat QR Code...</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-primary-500" />
            <span>Arahkan kamera HP / Tablet kasir ke QR Code</span>
          </div>
        </div>

        {/* Copy Download Link Input */}
        <div className="w-full space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tautan Unduh Langsung
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={resolvedDownloadUrl}
              className="flex-1 h-9 px-3 text-xs bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-md text-slate-600 dark:text-slate-300 font-mono select-all focus:outline-none"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-9 px-3 gap-1.5 text-xs shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Salin Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-galaxy-border/50">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
          <a
            href={resolvedDownloadUrl}
            download={`POS-v${release.versionName}.apk`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button type="button" variant="primary" size="sm" className="gap-1.5 shadow-galaxy-cyan">
              <Download className="h-3.5 w-3.5" />
              <span>Unduh File APK ({release.fileSizeFormatted})</span>
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
