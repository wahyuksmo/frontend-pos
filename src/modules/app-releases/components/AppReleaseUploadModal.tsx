"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileArchive, X, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { CreateAppReleasePayload } from "@/types";

export interface AppReleaseUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAppReleasePayload) => Promise<void>;
  loading: boolean;
  nextVersionCode?: number;
}

export function AppReleaseUploadModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  nextVersionCode,
}: AppReleaseUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState<number | undefined>(nextVersionCode);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [isLatest, setIsLatest] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Helper format bytes
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".apk")) {
      setError("File harus berupa berkas Android APK (.apk)");
      return;
    }

    // Limit check: 350MB
    if (file.size > 350 * 1024 * 1024) {
      setError("Ukuran file APK melebihi batas maksimal 350 MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Try auto-guessing version from filename if not yet filled
    // e.g. pos-v1.0.2.apk or app-1.0.0.apk
    if (!versionName) {
      const match = file.name.match(/v?(\d+\.\d+(\.\d+)?)/i);
      if (match && match[1]) {
        setVersionName(match[1]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Silakan pilih file APK terlebih dahulu.");
      return;
    }

    if (!versionName.trim()) {
      setError("Versi aplikasi wajib diisi (contoh: 1.0.1).");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        file: selectedFile,
        versionName: versionName.trim(),
        versionCode: versionCode ? Number(versionCode) : undefined,
        releaseNotes: releaseNotes.trim() || undefined,
        isLatest: isLatest ? "Y" : "N",
        isActive: isActive ? "Y" : "N",
      });
      handleClose();
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah file APK.");
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setVersionName("");
    setVersionCode(nextVersionCode);
    setReleaseNotes("");
    setIsLatest(true);
    setIsActive(true);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload APK Baru"
      description="Unggah file build APK kasir Android untuk didistribusikan ke perangkat tablet/POS."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* File Dropzone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Berkas APK (.apk) <span className="text-rose-500">*</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            accept=".apk,application/vnd.android.package-archive"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileChange(e.dataTransfer.files?.[0] || null);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-primary-500 bg-primary-50/20"
                  : "border-slate-300 dark:border-galaxy-border hover:border-primary-400 bg-slate-50/50 dark:bg-galaxy-input"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-primary-100/50 dark:bg-primary-950/40 text-primary-500 rounded-full">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Klik untuk memilih atau seret berkas APK ke sini
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hanya mendukung format .apk (Maks. 350 MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-lg shrink-0">
                  <FileArchive className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formatSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Version Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Versi Aplikasi (Semantic) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: 1.0.1"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              required
              disabled={loading}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kode Build (Version Code)
            </label>
            <Input
              type="number"
              placeholder="Auto-increment jika kosong"
              value={versionCode ?? ""}
              onChange={(e) =>
                setVersionCode(e.target.value ? Number(e.target.value) : undefined)
              }
              min={1}
              disabled={loading}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Release Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Catatan Perubahan (Changelog / Release Notes)
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan daftar pembaruan atau perbaikan bug pada rilis ini..."
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            disabled={loading}
            className="w-full text-xs p-2.5 rounded-md border border-slate-200 dark:border-galaxy-border bg-white dark:bg-galaxy-input text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50/60 dark:bg-galaxy-input/40 rounded-lg border border-slate-200/70 dark:border-galaxy-border/50">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Jadikan Rilis Utama (Latest)
              </p>
              <p className="text-[11px] text-slate-400">
                Ditargetkan untuk unduhan utama & QR Code
              </p>
            </div>
            <Switch
              checked={isLatest}
              onChange={setIsLatest}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Status Rilis Aktif
              </p>
              <p className="text-[11px] text-slate-400">
                Dapat diunduh oleh publik & kasir
              </p>
            </div>
            <Switch
              checked={isActive}
              onChange={setIsActive}
              disabled={loading}
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-galaxy-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading}
            className="gap-1.5 shadow-galaxy-cyan"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Mengunggah APK...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Simpan & Rilis APK</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
