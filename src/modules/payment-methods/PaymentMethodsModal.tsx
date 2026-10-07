"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { paymentMethodsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { PaymentMethod } from "@/types";

export interface PaymentMethodsModalProps {
  isOpen: boolean;
  initialData?: PaymentMethod | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentMethodsModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: PaymentMethodsModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    methodCode: "",
    methodName: "",
    methodType: "CASH",
    feeType: "NONE",
    feeValue: 0,
    requiresReference: "N",
    displayOrder: 0,
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        methodCode: initialData.methodCode || "",
        methodName: initialData.methodName || "",
        methodType: initialData.methodType || "CASH",
        feeType: initialData.feeType || "NONE",
        feeValue: Number(initialData.feeValue || 0),
        requiresReference: initialData.requiresReference || initialData.requiresRef || "N",
        displayOrder: Number(initialData.displayOrder ?? initialData.sortOrder ?? 0),
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        methodCode: "",
        methodName: "",
        methodType: "CASH",
        feeType: "NONE",
        feeValue: 0,
        requiresReference: "N",
        displayOrder: 0,
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.methodCode.trim() || !formData.methodName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama metode pembayaran wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        methodCode: formData.methodCode.trim().toUpperCase(),
        methodName: formData.methodName.trim(),
        methodType: formData.methodType,
        feeType: formData.feeType,
        feeValue: Number(formData.feeValue),
        requiresReference: formData.requiresReference as "Y" | "N",
        displayOrder: Number(formData.displayOrder),
        isActive: formData.isActive as "Y" | "N",
      };

      if (isEdit && initialData) {
        await paymentMethodsService.update(initialData.paymentMethodId, payload);
        showSuccessAlert("Berhasil Diperbarui", "Metode pembayaran berhasil disimpan.");
      } else {
        await paymentMethodsService.create(payload);
        showSuccessAlert("Berhasil Dibuat", "Metode pembayaran baru berhasil ditambahkan.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan Data", err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions = [
    { value: "CASH", label: "Tunai (Cash)" },
    { value: "EDC_DEBIT", label: "Kartu Debit (EDC)" },
    { value: "EDC_CREDIT", label: "Kartu Kredit (EDC)" },
    { value: "QRIS", label: "QRIS" },
    { value: "EWALLET", label: "E-Wallet" },
    { value: "BANK_TRANSFER", label: "Transfer Bank" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran Baru"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Metode <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: CASH, QRIS-BCA, DEBIT-MDR"
              value={formData.methodCode}
              onChange={(e) => setFormData({ ...formData, methodCode: e.target.value.toUpperCase() })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono uppercase text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Metode <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: QRIS BCA Dynamic"
              value={formData.methodName}
              onChange={(e) => setFormData({ ...formData, methodName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Tipe Kanal
              </label>
              <SearchableSelect
                size="sm"
                options={typeOptions}
                value={formData.methodType}
                onChange={(val) => setFormData({ ...formData, methodType: val })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Urutan Tampil
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Tipe Biaya (Fee)
              </label>
              <SearchableSelect
                size="sm"
                options={[
                  { value: "NONE", label: "Tidak Ada (0)" },
                  { value: "PERCENTAGE", label: "Persentase (%)" },
                  { value: "FIXED", label: "Nominal Tetap (Rp)" },
                ]}
                value={formData.feeType}
                onChange={(val) => setFormData({ ...formData, feeType: val })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Nilai Biaya {formData.feeType === "PERCENTAGE" ? "(%)" : "(Rp)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={formData.feeType === "NONE"}
                value={formData.feeValue}
                onChange={(e) => setFormData({ ...formData, feeValue: Number(e.target.value) })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 disabled:opacity-50 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Wajib No. Referensi?
              </label>
              <SearchableSelect
                size="sm"
                options={[
                  { value: "N", label: "Tidak Wajib" },
                  { value: "Y", label: "Wajib (Input Kasir)" },
                ]}
                value={formData.requiresReference}
                onChange={(val) => setFormData({ ...formData, requiresReference: val })}
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
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Metode"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
