"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { diningTablesService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { DiningTable, SelectOption } from "@/types";

export interface DiningTablesModalProps {
  isOpen: boolean;
  initialData?: DiningTable | null;
  outletOptions: SelectOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function DiningTablesModal({
  isOpen,
  initialData,
  outletOptions,
  onClose,
  onSuccess,
}: DiningTablesModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    outletId: "",
    tableCode: "",
    tableName: "",
    section: "Indoor",
    capacity: 4,
    status: "AVAILABLE",
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        outletId: initialData.outletId || "",
        tableCode: initialData.tableCode || "",
        tableName: initialData.tableName || "",
        section: initialData.section || "Indoor",
        capacity: initialData.capacity || 4,
        status: initialData.status || "AVAILABLE",
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        outletId: outletOptions[0]?.value || "",
        tableCode: "",
        tableName: "",
        section: "Indoor",
        capacity: 4,
        status: "AVAILABLE",
        isActive: "Y",
      });
    }
  }, [initialData, isOpen, outletOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.outletId) {
      showErrorAlert("Validasi Gagal", "Cabang outlet wajib dipilih.");
      return;
    }
    if (!formData.tableCode.trim() || !formData.tableName.trim()) {
      showErrorAlert("Validasi Gagal", "Nomor dan Nama Meja wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && initialData) {
        await diningTablesService.update(initialData.tableId, {
          ...formData,
          capacity: Number(formData.capacity),
        } as any);
        showSuccessAlert("Berhasil Diperbarui", "Data meja berhasil disimpan.");
      } else {
        await diningTablesService.create({
          ...formData,
          capacity: Number(formData.capacity),
        } as any);
        showSuccessAlert("Berhasil Dibuat", "Meja baru berhasil ditambahkan.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan Data", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "AVAILABLE", label: "Tersedia (Available)" },
    { value: "OCCUPIED", label: "Terisi (Occupied)" },
    { value: "RESERVED", label: "Dipesan (Reserved)" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Data Meja" : "Tambah Meja Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Cabang Outlet <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              size="sm"
              options={outletOptions}
              value={formData.outletId}
              onChange={(val) => setFormData({ ...formData, outletId: val })}
              placeholder="Pilih Outlet..."
              clearable={false}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nomor / Kode Meja <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: T-01"
              value={formData.tableCode}
              onChange={(e) => setFormData({ ...formData, tableCode: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Meja <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Meja 01 Indoor Depan"
              value={formData.tableName}
              onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Area / Bagian Lantai
            </label>
            <input
              type="text"
              placeholder="Contoh: Indoor, Outdoor, Lt 2, VIP"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kapasitas Kursi <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Ketersediaan
            </label>
            <SearchableSelect
              size="sm"
              options={statusOptions}
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              placeholder="Pilih Status..."
              clearable={false}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Aktif
            </label>
            <select
              value={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            >
              <option value="Y">Aktif</option>
              <option value="N">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200/80 dark:border-galaxy-border/80">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting}
            className="shadow-galaxy-cyan"
          >
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Meja"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
