"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { categoriesService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { Category, SelectOption } from "@/types";

export interface CategoriesModalProps {
  isOpen: boolean;
  initialData?: Category | null;
  parentOptions: SelectOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoriesModal({
  isOpen,
  initialData,
  parentOptions,
  onClose,
  onSuccess,
}: CategoriesModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    categoryCode: "",
    categoryName: "",
    parentCategoryId: "",
    icon: "",
    color: "#3B82F6",
    displayOrder: 0,
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        categoryCode: initialData.categoryCode || "",
        categoryName: initialData.categoryName || "",
        parentCategoryId: initialData.parentCategoryId || "",
        icon: initialData.icon || "",
        color: initialData.color || "#3B82F6",
        displayOrder: initialData.displayOrder || 0,
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        categoryCode: "",
        categoryName: "",
        parentCategoryId: "",
        icon: "",
        color: "#3B82F6",
        displayOrder: 0,
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryCode.trim() || !formData.categoryName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama Kategori wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        parentCategoryId: formData.parentCategoryId || undefined,
        displayOrder: Number(formData.displayOrder),
      };

      if (isEdit && initialData) {
        await categoriesService.update(initialData.categoryId, payload as any);
        showSuccessAlert("Berhasil Diperbarui", "Data kategori berhasil disimpan.");
      } else {
        await categoriesService.create(payload as any);
        showSuccessAlert("Berhasil Dibuat", "Kategori baru berhasil ditambahkan.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan Data", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Data Kategori" : "Tambah Kategori Baru"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kategori Induk (Opsional)
            </label>
            <SearchableSelect
              size="sm"
              options={[{ value: "", label: "Tanpa Induk (Kategori Utama / Root)" }, ...parentOptions]}
              value={formData.parentCategoryId}
              onChange={(val) => setFormData({ ...formData, parentCategoryId: val })}
              placeholder="Pilih Kategori Induk..."
              clearable={true}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: CAT-BEV"
              value={formData.categoryCode}
              onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value.toUpperCase() })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Minuman & Kopi"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Warna Tag
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-mono dark:border-galaxy-border dark:bg-galaxy-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Urutan Tampil
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono dark:border-galaxy-border dark:bg-galaxy-input"
              />
            </div>
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
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Kategori"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
