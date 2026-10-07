"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Download,
  QrCode,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Plus,
  Star,
  HardDrive,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { AppRelease, PaginationMeta } from "@/types";

export interface AppReleaseTableProps {
  releases: AppRelease[];
  latestRelease: AppRelease | null;
  loading: boolean;
  meta?: PaginationMeta;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewDetail: (release: AppRelease) => void;
  onOpenQr: (release: AppRelease) => void;
  onToggleLatest: (release: AppRelease) => void;
  onToggleActive: (release: AppRelease) => void;
  onDelete: (release: AppRelease) => void;
  onOpenUpload: () => void;
}

export function AppReleaseTable({
  releases,
  latestRelease,
  loading,
  meta,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onOpenQr,
  onToggleLatest,
  onToggleActive,
  onDelete,
  onOpenUpload,
}: AppReleaseTableProps) {
  const total = meta?.total ?? releases.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  // Floating Dropdown Menu
  const [activeMenu, setActiveMenu] = useState<{
    release: AppRelease;
    top: number;
    left: number;
  } | null>(null);

  const handleToggleMenu = (release: AppRelease, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.release.releaseId === release.releaseId) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 160;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight;
    const top = openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const left = Math.max(10, rect.right - 176);

    setActiveMenu({ release, top, left });
  };

  useEffect(() => {
    if (!activeMenu) return;
    const handleClose = () => setActiveMenu(null);
    window.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [activeMenu]);

  return (
    <div className="space-y-6">
      {/* FEATURED: Latest Release Banner */}
      {latestRelease && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 p-6 text-white shadow-lg shadow-primary-500/10">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Smartphone className="h-7 w-7 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold tracking-tight">
                    POS Kasir Android v{latestRelease.versionName}
                  </span>
                  <span className="rounded-full bg-cyan-400/20 border border-cyan-400/40 px-2.5 py-0.5 text-xs font-semibold text-cyan-200">
                    Rilis Utama (Latest)
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80 font-mono">
                    Build #{latestRelease.versionCode}
                  </span>
                </div>
                <p className="text-xs text-white/80 max-w-xl line-clamp-2">
                  {latestRelease.releaseNotes ||
                    "Aplikasi kasir Android POS Enterprise siap dipasang pada tablet kasir, smartphone pramusaji, dan terminal Android."}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-cyan-100 font-mono">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 opacity-80" />
                    {latestRelease.fileSizeFormatted}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 opacity-80" />
                    {latestRelease.downloadCount} kali diunduh
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 opacity-80" />
                    {new Date(latestRelease.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenQr(latestRelease)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs gap-1.5 shadow-sm"
              >
                <QrCode className="h-4 w-4 text-cyan-300" />
                <span>Scan QR Code</span>
              </Button>

              <a
                href={
                  latestRelease.downloadUrl ||
                  (typeof window !== "undefined"
                    ? `${window.location.protocol}//${window.location.hostname}:7780/api/v1/app-releases/${latestRelease.releaseId}/download`
                    : `/api/v1/app-releases/${latestRelease.releaseId}/download`)
                }
                download={`POS-v${latestRelease.versionName}.apk`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="bg-cyan-400 text-slate-900 hover:bg-cyan-300 font-semibold text-xs gap-2 shadow-md shadow-cyan-500/20"
                >
                  <Download className="h-4 w-4" />
                  <span>Download APK ({latestRelease.fileSizeFormatted})</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border-slate-200 dark:border-galaxy-border bg-white dark:bg-galaxy-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-slate-100 dark:border-galaxy-border/60">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary-500" />
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Riwayat Rilis & Berkas APK
            </CardTitle>
            <Badge variant="outline" className="ml-2 font-mono text-[11px]">
              {total} Berkas
            </Badge>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenUpload}
            className="gap-1.5 shadow-galaxy-cyan"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Upload APK Baru</span>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {/* Entries Controller */}
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="h-8 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-primary-400 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entri</span>
            </div>
          </div>

          {/* Table Data */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : releases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-galaxy-input text-slate-400 mb-3">
                <Smartphone className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Belum Ada Berkas APK
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Klik tombol &quot;Upload APK Baru&quot; untuk mengunggah berkas aplikasi kasir Android pertama Anda.
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onOpenUpload}
                className="mt-4 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload APK Sekarang</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50/50 dark:bg-galaxy-thead border-y border-slate-200 dark:border-galaxy-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-center w-12">No</th>
                    <th className="py-3 px-4">Versi & Build</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Ukuran & File</th>
                    <th className="py-3 px-4 text-center">Diunduh</th>
                    <th className="py-3 px-4">Catatan Rilis</th>
                    <th className="py-3 px-4">Waktu Rilis</th>
                    <th className="py-3 px-6 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/60">
                  {releases.map((item, index) => {
                    const rowNumber = (currentPage - 1) * pageSize + index + 1;
                    const isLatest = item.isLatest === "Y";
                    const isActive = item.isActive === "Y";

                    const itemDownloadUrl =
                      item.downloadUrl ||
                      (typeof window !== "undefined"
                        ? `${window.location.protocol}//${window.location.hostname}:7780/api/v1/app-releases/${item.releaseId}/download`
                        : `/api/v1/app-releases/${item.releaseId}/download`);

                    return (
                      <tr
                        key={item.releaseId}
                        className="border-b border-slate-100 dark:border-galaxy-border/60 hover:bg-slate-50/50 dark:hover:bg-galaxy-hover/40 transition-colors text-xs text-slate-700 dark:text-slate-300"
                      >
                        {/* No */}
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                          {rowNumber}
                        </td>

                        {/* Versi & Build */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              v{item.versionName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-galaxy-input px-1.5 py-0.5 rounded">
                              Build #{item.versionCode}
                            </span>
                            {isLatest && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 px-1.5 py-0.5 rounded font-semibold">
                                <Sparkles className="w-2.5 h-2.5" />
                                Latest
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {isActive ? (
                            <Badge variant="success" className="text-[10px] px-2 py-0.5">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="danger" className="text-[10px] px-2 py-0.5">
                              Nonaktif
                            </Badge>
                          )}
                        </td>

                        {/* Ukuran & File */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {item.fileSizeFormatted}
                            </span>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs font-mono">
                              {item.originalName}
                            </p>
                          </div>
                        </td>

                        {/* Download count */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                          {item.downloadCount}x
                        </td>

                        {/* Catatan Rilis */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="truncate text-slate-600 dark:text-slate-400">
                            {item.releaseNotes || "-"}
                          </p>
                        </td>

                        {/* Waktu Rilis */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Download Button */}
                            <a
                              href={itemDownloadUrl}
                              download={`POS-v${item.versionName}.apk`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download APK"
                            >
                              <button
                                type="button"
                                className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-galaxy-input rounded-md transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </a>

                            {/* QR Code Button */}
                            <button
                              type="button"
                              onClick={() => onOpenQr(item)}
                              title="Scan QR Code"
                              className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-galaxy-input rounded-md transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            {/* Context Menu Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleMenu(item, e)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-galaxy-input rounded-md transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Floating Dropdown */}
          {activeMenu && (
            <div
              style={{
                position: "fixed",
                top: `${activeMenu.top}px`,
                left: `${activeMenu.left}px`,
                zIndex: 9999,
              }}
              className="w-44 bg-white dark:bg-galaxy-card rounded-lg shadow-xl border border-slate-200 dark:border-galaxy-border py-1 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  onViewDetail(activeMenu.release);
                  setActiveMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-galaxy-hover transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Lihat Detail</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleLatest(activeMenu.release);
                  setActiveMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-galaxy-hover transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {activeMenu.release.isLatest === "Y"
                    ? "Batal Rilis Utama"
                    : "Jadikan Rilis Utama"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleActive(activeMenu.release);
                  setActiveMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-galaxy-hover transition-colors"
              >
                {activeMenu.release.isActive === "Y" ? (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Nonaktifkan Rilis</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Aktifkan Rilis</span>
                  </>
                )}
              </button>

              <div className="h-px bg-slate-100 dark:bg-galaxy-border my-1" />

              <button
                type="button"
                onClick={() => {
                  onDelete(activeMenu.release);
                  setActiveMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Berkas APK</span>
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-galaxy-border/60">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan Halaman {currentPage} dari {totalPages} ({total} rilis)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="h-8 px-2.5 text-xs"
                >
                  Sebelumnya
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="h-8 px-2.5 text-xs"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
