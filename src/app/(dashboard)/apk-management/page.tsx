"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { appReleasesService } from "@/services";
import {
  AppReleaseFilter,
  AppReleaseTable,
  AppReleaseUploadModal,
  AppReleaseQrModal,
  AppReleaseDetailModal,
} from "@/modules/app-releases";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
  showLoadingAlert,
  closeAlert,
} from "@/lib/sweetalert";
import type { AppRelease, PaginationMeta, CreateAppReleasePayload } from "@/types";

export default function ApkManagementPage() {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [latestRelease, setLatestRelease] = useState<AppRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Query & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [activeRelease, setActiveRelease] = useState<AppRelease | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Fetch list of APK releases
  const fetchReleases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appReleasesService.findAll({
        page,
        limit,
        search: search || undefined,
        isActive: selectedStatus || undefined,
      });

      const items = res.data || [];
      setReleases(items);
      if (res.meta) setMeta(res.meta);

      // Check if there is a latest active release
      const currentLatest = items.find((r) => r.isLatest === "Y" && r.isActive === "Y") || items[0] || null;
      setLatestRelease(currentLatest);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data APK", err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedStatus]);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  // Handlers
  const handleResetFilters = () => {
    setSearch("");
    setSelectedStatus("");
    setPage(1);
  };

  const handleOpenDetail = (release: AppRelease) => {
    setActiveRelease(release);
    setIsDetailOpen(true);
  };

  const handleOpenQr = async (release: AppRelease) => {
    setActiveRelease(release);
    setIsQrOpen(true);
    try {
      const qrRes = await appReleasesService.getQrCode(release.releaseId);
      setQrCodeDataUrl(qrRes.qrCode);
    } catch {
      // Fallback: modal will handle display
    }
  };

  const handleUploadSubmit = async (payload: CreateAppReleasePayload) => {
    setUploading(true);
    try {
      showLoadingAlert("Mengunggah Berkas APK...", "Proses ini memerlukan waktu beberapa saat sesuai ukuran file.");
      await appReleasesService.upload(payload);
      closeAlert();
      await showSuccessAlert(
        "Upload Berhasil!",
        `Berkas APK versi ${payload.versionName} telah berhasil disimpan dan siap diunduh.`
      );
      setIsUploadOpen(false);
      fetchReleases();
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Upload APK", err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleToggleLatest = async (release: AppRelease) => {
    const newLatest = release.isLatest === "Y" ? "N" : "Y";
    try {
      showLoadingAlert("Memperbarui Status...");
      await appReleasesService.update(release.releaseId, { isLatest: newLatest });
      closeAlert();
      await showSuccessAlert(
        "Status Diperbarui",
        newLatest === "Y"
          ? `Versi ${release.versionName} sekarang menjadi Rilis Utama (Latest).`
          : `Status Rilis Utama versi ${release.versionName} telah dinonaktifkan.`
      );
      fetchReleases();
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Memperbarui", err.message);
    }
  };

  const handleToggleActive = async (release: AppRelease) => {
    const newActive = release.isActive === "Y" ? "N" : "Y";
    try {
      showLoadingAlert("Memperbarui Status...");
      await appReleasesService.update(release.releaseId, { isActive: newActive });
      closeAlert();
      await showSuccessAlert(
        "Status Diperbarui",
        newActive === "Y"
          ? `Rilis APK v${release.versionName} berhasil diaktifkan.`
          : `Rilis APK v${release.versionName} berhasil dinonaktifkan.`
      );
      fetchReleases();
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Memperbarui", err.message);
    }
  };

  const handleDelete = async (release: AppRelease) => {
    const result = await showConfirmDialog({
      title: `Hapus APK v${release.versionName}?`,
      text: `Berkas fisik APK (${release.originalName}) akan dihapus secara permanen dari server POS. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus APK",
      cancelText: "Batal",
      isDanger: true,
    });

    if (result.isConfirmed) {
      try {
        showLoadingAlert("Menghapus Berkas APK...");
        await appReleasesService.delete(release.releaseId);
        closeAlert();
        await showSuccessAlert("Berhasil Dihapus", `Rilis APK v${release.versionName} telah dihapus.`);
        fetchReleases();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Menghapus APK", err.message);
      }
    }
  };

  // Next suggested version code
  const highestVersionCode =
    releases.length > 0 ? Math.max(...releases.map((r) => r.versionCode || 0)) : 1;
  const nextVersionCode = highestVersionCode + 1;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Breadcrumbs */}
      <PageTitleBox
        title="Manajemen APK Kasir"
        category="Administrasi Sistem"
      />

      {/* Filter Bar */}
      <AppReleaseFilter
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Main Table & Featured Banner */}
      <AppReleaseTable
        releases={releases}
        latestRelease={latestRelease}
        loading={loading}
        meta={meta}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onViewDetail={handleOpenDetail}
        onOpenQr={handleOpenQr}
        onToggleLatest={handleToggleLatest}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Modals */}
      <AppReleaseUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmit={handleUploadSubmit}
        loading={uploading}
        nextVersionCode={nextVersionCode}
      />

      <AppReleaseQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        release={activeRelease}
        qrCodeDataUrl={qrCodeDataUrl}
      />

      <AppReleaseDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        release={activeRelease}
        onOpenQr={handleOpenQr}
      />
    </div>
  );
}
