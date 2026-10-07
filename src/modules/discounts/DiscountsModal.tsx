"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { discountsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { Discount } from "@/types";

export interface DiscountsModalProps {
  isOpen: boolean;
  initialData?: Discount | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DiscountsModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: DiscountsModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    discountCode: "",
    discountName: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: 0,
    startDate: "",
    endDate: "",
    requiresApproval: "N",
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        discountCode: initialData.discountCode || "",
        discountName: initialData.discountName || "",
        discountType: initialData.discountType || "PERCENTAGE",
        discountValue: Number(initialData.discountValue || 0),
        minPurchase: Number(initialData.minPurchase || 0),
        maxDiscount: Number(initialData.maxDiscount || 0),
        startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : "",
        endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : "",
        requiresApproval: initialData.requiresApproval || "N",
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        discountCode: "",
        discountName: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        minPurchase: 0,
        maxDiscount: 0,
        startDate: "",
        endDate: "",
        requiresApproval: "N",
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.discountCode.trim() || !formData.discountName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama diskon wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        discountCode: formData.discountCode.trim().toUpperCase(),
        discountName: formData.discountName.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        requiresApproval: formData.requiresApproval as "Y" | "N",
        isActive: formData.isActive as "Y" | "N",
      };

      if (isEdit && initialData) {
        await discountsService.update(initialData.discountId, payload);
        showSuccessAlert("Berhasil Diperbarui", "Data diskon/promosi berhasil disimpan.");
      } else {
        await discountsService.create(payload);
        showSuccessAlert("Berhasil Dibuat", "Diskon/promosi baru berhasil ditambahkan.");
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
      title={isEdit ? "Edit Diskon & Promosi" : "Tambah Diskon Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Promo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: PROMO-10, FLASH15"
              value={formData.discountCode}
              onChange={(e) => setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono uppercase text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Diskon / Promosi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Diskon Weekend Spesial 10%"
              value={formData.discountName}
              onChange={(e) => setFormData({ ...formData, discountName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Tipe Diskon
            </label>
            <SearchableSelect
              size="sm"
              options={[
                { value: "PERCENTAGE", label: "Persentase (%)" },
                { value: "FIXED_AMOUNT", label: "Potongan Tetap (Rp)" },
              ]}
              value={formData.discountType}
              onChange={(val) => setFormData({ ...formData, discountType: val })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nilai Diskon {formData.discountType === "PERCENTAGE" ? "(%)" : "(Rp)"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Minimal Belanja (Rp)
            </label>
            <input
              type="number"
              step="1000"
              min="0"
              value={formData.minPurchase}
              onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Maksimal Nilai Diskon (Rp)
            </label>
            <input
              type="number"
              step="1000"
              min="0"
              placeholder="0 jika tanpa batas maksimal"
              value={formData.maxDiscount}
              onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Tanggal Mulai Promo
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Tanggal Berakhir Promo
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Otorisasi Supervisor Kasir?
            </label>
            <SearchableSelect
              size="sm"
              options={[
                { value: "N", label: "Otomatis Berlaku (Tanpa Approval)" },
                { value: "Y", label: "Wajib Approval Supervisor (SPV)" },
              ]}
              value={formData.requiresApproval}
              onChange={(val) => setFormData({ ...formData, requiresApproval: val })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Promo
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
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Diskon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
