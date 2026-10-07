"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { customerGroupsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { CustomerGroup } from "@/types";

export interface CustomerGroupsModalProps {
  isOpen: boolean;
  initialData?: CustomerGroup | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerGroupsModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: CustomerGroupsModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    groupCode: "",
    groupName: "",
    discountPercent: 0,
    description: "",
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        groupCode: initialData.groupCode || "",
        groupName: initialData.groupName || "",
        discountPercent: Number(initialData.discountPercent || 0),
        description: initialData.description || "",
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        groupCode: "",
        groupName: "",
        discountPercent: 0,
        description: "",
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupCode.trim() || !formData.groupName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama grup wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        groupCode: formData.groupCode.trim().toUpperCase(),
        groupName: formData.groupName.trim(),
        discountPercent: Number(formData.discountPercent),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive as "Y" | "N",
      };

      if (isEdit && initialData) {
        await customerGroupsService.update(initialData.customerGroupId, payload);
        showSuccessAlert("Berhasil Diperbarui", "Data grup pelanggan berhasil disimpan.");
      } else {
        await customerGroupsService.create(payload);
        showSuccessAlert("Berhasil Dibuat", "Grup pelanggan baru berhasil ditambahkan.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan Data", err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Data Grup Pelanggan" : "Tambah Grup Pelanggan Baru"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Grup <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: VIP, MEMBER, REGULER"
              value={formData.groupCode}
              onChange={(e) => setFormData({ ...formData, groupCode: e.target.value.toUpperCase() })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono uppercase text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Grup <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Member VIP Prioritas"
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Diskon Default (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Status Aktif
              </label>
              <SearchableSelect
                size="sm"
                options={[
                  { value: "Y", label: "Aktif" },
                  { value: "N", label: "Nonaktif" },
                ]}
                value={formData.isActive}
                onChange={(val) => setFormData({ ...formData, isActive: val })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Keterangan
            </label>
            <textarea
              rows={3}
              placeholder="Catatan fasilitas grup pelanggan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
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
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Grup"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
