"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sliders, KeyRound, GitPullRequest, LockKeyhole } from "lucide-react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { settingsService } from "@/services";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
  showLoadingAlert,
  closeAlert,
} from "@/lib/sweetalert";
import {
  SettingFilter,
  SettingTable,
  SettingCreateModal,
  SettingEditModal,
  SettingDetailModal,
} from "@/modules/settings";
import { PermissionsMatrixView } from "@/modules/permissions";
import { cn } from "@/lib/utils";
import type { SystemSetting, PaginationMeta } from "@/types";
import type { CreateSettingData } from "@/services/settings.service";

function SettingsManagementContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "parameters";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Server-side filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedValueType, setSelectedValueType] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeSetting, setActiveSetting] = useState<SystemSetting | null>(null);

  // Fetch Settings with Server-Side Querying
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsService.findAll({
        page,
        limit,
        search: search || undefined,
      });

      let items = res.data || [];
      if (selectedValueType) {
        items = items.filter(
          (s) => s.valueType?.toLowerCase() === selectedValueType.toLowerCase()
        );
      }

      setSettings(items);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedValueType]);

  useEffect(() => {
    if (activeTab === "parameters") {
      fetchSettings();
    }
  }, [fetchSettings, activeTab]);

  // Handlers
  const handleResetFilters = () => {
    setSearch("");
    setSelectedValueType("");
    setPage(1);
  };

  const handleCreateSetting = async (data: CreateSettingData) => {
    showLoadingAlert("Menyimpan...", "Mendaftarkan konfigurasi baru ke database...");
    try {
      const res = await settingsService.create(data);
      closeAlert();
      await showSuccessAlert("Berhasil!", `Setting "${res.data.settingKey}" berhasil dibuat.`);
      fetchSettings();
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Menyimpan", err.message);
      throw err;
    }
  };

  const handleEditSetting = async (id: string, data: Partial<SystemSetting>) => {
    showLoadingAlert("Memperbarui...", "Menyimpan perubahan setting...");
    try {
      await settingsService.update(id, data);
      closeAlert();
      await showSuccessAlert("Berhasil!", "Pengaturan sistem berhasil diperbarui.");
      fetchSettings();
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Memperbarui", err.message);
      throw err;
    }
  };

  const handleDeleteSetting = async (setting: SystemSetting) => {
    const confirm = await showConfirmDialog({
      title: "Hapus Setting?",
      text: `Hapus setting "${setting.settingKey}"? Tindakan ini tidak dapat dibatalkan.`,
      isDanger: true,
    });

    if (confirm.isConfirmed) {
      showLoadingAlert("Menghapus...", "Sedang menghapus data setting...");
      try {
        await settingsService.delete(setting.settingId);
        closeAlert();
        await showSuccessAlert("Dihapus!", `Setting "${setting.settingKey}" telah dihapus.`);
        fetchSettings();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Menghapus", err.message);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ["Setting ID,Setting Key,Setting Value,Value Type,Description,Object Code,Created By,Created At"];
    const rows = settings.map((s) =>
      `"${s.settingId}","${s.settingKey}","${(s.settingValue || "").replace(/"/g, '""')}","${s.valueType}","${s.description || ""}","${s.objectCode || "SETTING"}","${s.createdBy || ""}","${s.createdAt}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `settings_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <PageTitleBox
        title="Pengaturan Sistem & Hak Akses"
        category="Konfigurasi & Hak Akses"
      />

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 dark:border-galaxy-border/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("parameters")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
            activeTab === "parameters"
              ? "bg-primary-400 text-slate-950 font-bold shadow-galaxy-cyan"
              : "bg-white dark:bg-galaxy-card text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-galaxy-border/80 hover:bg-slate-50 dark:hover:bg-galaxy-hover"
          )}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Konfigurasi Parameter</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("permissions")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
            activeTab === "permissions"
              ? "bg-primary-400 text-slate-950 font-bold shadow-galaxy-cyan"
              : "bg-white dark:bg-galaxy-card text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-galaxy-border/80 hover:bg-slate-50 dark:hover:bg-galaxy-hover"
          )}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>Hak Akses User & Role (Permission)</span>
        </button>

        <Link
          href="/settings/approval-templates"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all bg-white dark:bg-galaxy-card text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-galaxy-border/80 hover:bg-slate-50 dark:hover:bg-galaxy-hover"
        >
          <GitPullRequest className="h-3.5 w-3.5" />
          <span>Template Approval</span>
        </Link>

        <Link
          href="/password-policies"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all bg-white dark:bg-galaxy-card text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-galaxy-border/80 hover:bg-slate-50 dark:hover:bg-galaxy-hover"
        >
          <LockKeyhole className="h-3.5 w-3.5" />
          <span>Kebijakan Password</span>
        </Link>
      </div>

      {/* Tab Content: Parameter Sistem */}
      {activeTab === "parameters" && (
        <div className="space-y-5">
          <SettingFilter
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            selectedValueType={selectedValueType}
            onValueTypeChange={(v) => {
              setSelectedValueType(v);
              setPage(1);
            }}
            onReset={handleResetFilters}
          />

          <SettingTable
            settings={settings}
            loading={loading}
            meta={meta}
            currentPage={page}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            onViewDetail={(s) => {
              setActiveSetting(s);
              setIsDetailOpen(true);
            }}
            onEdit={(s) => {
              setActiveSetting(s);
              setIsEditOpen(true);
            }}
            onDelete={handleDeleteSetting}
            onOpenCreate={() => setIsCreateOpen(true)}
            onExport={handleExportCSV}
          />
        </div>
      )}

      {/* Tab Content: Hak Akses Role & User */}
      {activeTab === "permissions" && (
        <PermissionsMatrixView showTitleBox={false} />
      )}

      {/* Modals for Parameters */}
      <SettingCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSetting}
      />

      <SettingEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSetting}
        setting={activeSetting}
      />

      <SettingDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        setting={activeSetting}
      />
    </div>
  );
}

export default function SettingsManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat pengaturan...</div>}>
      <SettingsManagementContent />
    </Suspense>
  );
}
