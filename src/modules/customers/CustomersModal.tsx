"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { customersService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { Customer, SelectOption } from "@/types";

export interface CustomersModalProps {
  isOpen: boolean;
  initialData?: Customer | null;
  groupOptions: SelectOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomersModal({
  isOpen,
  initialData,
  groupOptions,
  onClose,
  onSuccess,
}: CustomersModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    customerCode: "",
    customerName: "",
    customerGroupId: "",
    phone: "",
    email: "",
    address: "",
    creditLimit: 0,
    loyaltyPoints: 0,
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        customerCode: initialData.customerCode || "",
        customerName: initialData.customerName || "",
        customerGroupId: initialData.customerGroupId || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        creditLimit: Number(initialData.creditLimit || 0),
        loyaltyPoints: Number(initialData.loyaltyPoints ?? initialData.points ?? 0),
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        customerCode: "",
        customerName: "",
        customerGroupId: "",
        phone: "",
        email: "",
        address: "",
        creditLimit: 0,
        loyaltyPoints: 0,
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerCode.trim() || !formData.customerName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama pelanggan wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerCode: formData.customerCode.trim().toUpperCase(),
        customerName: formData.customerName.trim(),
        customerGroupId: formData.customerGroupId || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        creditLimit: Number(formData.creditLimit),
        loyaltyPoints: Number(formData.loyaltyPoints),
        isActive: formData.isActive as "Y" | "N",
      };

      if (isEdit && initialData) {
        await customersService.update(initialData.customerId, payload);
        showSuccessAlert("Berhasil Diperbarui", "Data pelanggan berhasil disimpan.");
      } else {
        await customersService.create(payload);
        showSuccessAlert("Berhasil Dibuat", "Pelanggan baru berhasil ditambahkan.");
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
      title={isEdit ? "Edit Data Pelanggan" : "Tambah Pelanggan Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Pelanggan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: CUST-0001"
              value={formData.customerCode}
              onChange={(e) => setFormData({ ...formData, customerCode: e.target.value.toUpperCase() })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono uppercase text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Lengkap Pelanggan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Budi Santoso"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Grup Pelanggan
            </label>
            <SearchableSelect
              size="sm"
              options={[{ value: "", label: "Tanpa Grup (Reguler)" }, ...groupOptions]}
              value={formData.customerGroupId}
              onChange={(val) => setFormData({ ...formData, customerGroupId: val })}
              placeholder="Pilih Grup..."
              clearable={Boolean(formData.customerGroupId)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              placeholder="Misal: 08123456789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="Misal: budi@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Limit Kredit Transaksi (Rp)
            </label>
            <input
              type="number"
              step="1000"
              min="0"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Poin Loyalitas
            </label>
            <input
              type="number"
              min="0"
              value={formData.loyaltyPoints}
              onChange={(e) => setFormData({ ...formData, loyaltyPoints: Number(e.target.value) })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Keanggotaan
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
            Alamat Domisili
          </label>
          <textarea
            rows={2}
            placeholder="Alamat lengkap pelanggan..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
          />
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
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Pelanggan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
