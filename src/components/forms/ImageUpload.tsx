"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { getImageUrl } from "@/lib/image";
import { uploadService } from "@/services/upload.service";
import { cn } from "@/lib/utils";

export interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Foto / Gambar Produk",
  error,
  helperText = "Format JPG, PNG, WEBP, GIF (Maks. 5MB)",
  disabled = false,
  className,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with incoming value (e.g. from initialData / edit mode)
  useEffect(() => {
    if (value) {
      setPreviewUrl(getImageUrl(value));
    } else {
      setPreviewUrl("");
    }
    setUploadError(null);
  }, [value]);

  const handleFileProcess = async (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Format file tidak didukung! Pilih file JPG, PNG, WEBP, atau GIF.");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar! Maksimal 5MB.");
      return;
    }

    setUploadError(null);

    // Instant local preview for immediate visual feedback
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Auto upload to backend
    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file);
      onChange(result.url);
      setPreviewUrl(getImageUrl(result.url));
    } catch (err: any) {
      setUploadError(err.message || "Gagal mengunggah gambar. Silakan coba lagi.");
      // If error, rollback preview if no prior value
      if (!value) {
        setPreviewUrl("");
      }
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input so the same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || uploading) return;
    setPreviewUrl("");
    setUploadError(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerSelect = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const displayError = error || uploadError;

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 font-heading">
            <ImageIcon className="h-3.5 w-3.5 text-primary-400" />
            <span>{label}</span>
          </label>
          {previewUrl && (
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Siap Digunakan
            </span>
          )}
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Main Upload Box */}
      {previewUrl ? (
        /* Preview Card */
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 dark:border-galaxy-border dark:bg-galaxy-card transition-all">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Image Preview Thumbnail */}
            <div className="relative h-32 w-32 sm:h-28 sm:w-28 shrink-0 rounded-lg overflow-hidden border border-slate-200/80 bg-slate-100 dark:border-galaxy-border/80 dark:bg-galaxy-input flex items-center justify-center group shadow-sm">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {uploading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 text-white">
                  <RefreshCw className="h-5 w-5 animate-spin text-primary-400" />
                  <span className="text-[10px] font-medium">Mengunggah...</span>
                </div>
              )}
            </div>

            {/* Info & Action Buttons */}
            <div className="flex flex-1 flex-col justify-between self-stretch py-0.5 text-center sm:text-left">
              <div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-100 font-heading">
                  Preview Gambar
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 line-clamp-1 font-mono">
                  {value ? value.split("/").pop() : "File lokal dipilih"}
                </p>
                <div className="mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300 border border-primary-200/50 dark:border-primary-500/20">
                    Preview Aktif
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-galaxy-border/60">
                <button
                  type="button"
                  onClick={triggerSelect}
                  disabled={disabled || uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-200 dark:hover:bg-galaxy-hover transition-colors shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-primary-400" />
                  <span>Ganti Gambar</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Dropzone State */
        <div
          onClick={triggerSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200",
            isDragOver
              ? "border-primary-400 bg-primary-500/5 scale-[1.005]"
              : "border-slate-300/80 bg-slate-50/50 hover:border-primary-400 hover:bg-slate-100/50 dark:border-galaxy-border dark:bg-galaxy-input/30 dark:hover:border-primary-400 dark:hover:bg-galaxy-input/60",
            disabled && "cursor-not-allowed opacity-50",
            displayError && "border-rose-400 dark:border-rose-500/60"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-400" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Mengunggah gambar ke server...
              </p>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-500/10 dark:text-primary-400 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  <span className="text-primary-500 dark:text-primary-400 font-semibold underline decoration-primary-400/40 underline-offset-2">
                    Klik untuk memilih file
                  </span>{" "}
                  atau seret dan lepas gambar ke sini
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {helperText}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 animate-fadeIn">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
