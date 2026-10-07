"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { warehousesService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { Warehouse, SelectOption } from "@/types";

export interface WarehousesModalProps {
  isOpen: boolean;
  initialData?: Warehouse | null;
  outletOptions: SelectOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function WarehousesModal({
  isOpen,
  initialData,
  outletOptions,
  onClose,
  onSuccess,
}: WarehousesModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    outletId: "",
    warehouseCode: "",
    warehouseName: "",
    warehouseType: "GENERAL",
    address: "",
    isDefault: "N",
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        outletId: initialData.outletId || "",
        warehouseCode: initialData.warehouseCode || "",
        warehouseName: initialData.warehouseName || "",
        warehouseType: initialData.warehouseType || "GENERAL",
        address: initialData.address || "",
        isDefault: initialData.isDefault || "N",
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        outletId: "",
        warehouseCode: "",
        warehouseName: "",
        warehouseType: "GENERAL",
        address: "",
        isDefault: "N",
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouseCode.trim() || !formData.warehouseName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama Gudang wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        outletId: formData.outletId || undefined,
      };

      if (isEdit && initialData) {
        await warehousesService.update(initialData.warehouseId, payload as any);
        showSuccessAlert("Berhasil Diperbarui", "Data gudang berhasil disimpan.");
      } else {
        await warehousesService.create(payload as any);
        showSuccessAlert("Berhasil Dibuat", "Gudang baru berhasil ditambahkan.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan Data", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions = [
    { value: "GENERAL", label: "Gudang Utama (General)" },
    { value: "KITCHEN", label: "Dapur Resto (Kitchen)" },
    { value: "BAR", label: "Bar Minuman" },
    { value: "TRANSIT", label: "Transit / Logistik" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Data Gudang" : "Tambah Gudang Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Cabang Outlet Terkait
            </label>
            <SearchableSelect
              size="sm"
              options={[{ value: "", label: "Sentral / Semua Cabang" }, ...outletOptions]}
              value={formData.outletId}
              onChange={(val) => setFormData({ ...formData, outletId: val })}
              placeholder="Pilih Outlet (Opsional)..."
              clearable={true}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Gudang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: GDG-PST"
              value={formData.warehouseCode}
              onChange={(e) => setFormData({ ...formData, warehouseCode: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Gudang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gudang Logistik Utama"
              value={formData.warehouseName}
              onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Tipe Gudang
            </label>
            <SearchableSelect
              size="sm"
              options={typeOptions}
              value={formData.warehouseType}
              onChange={(val) => setFormData({ ...formData, warehouseType: val })}
              placeholder="Pilih Tipe..."
              clearable={false}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Gudang Utama
            </label>
            <select
              value={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            >
              <option value="N">Bukan Gudang Utama</option>
              <option value="Y">Ya (Gudang Utama)</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Alamat Gudang
            </label>
            <textarea
              rows={2}
              placeholder="Alamat fisik pergudangan..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Gudang
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
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Gudang"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
