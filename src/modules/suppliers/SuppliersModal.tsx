"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { suppliersService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { Supplier } from "@/types";

export interface SuppliersModalProps {
  isOpen: boolean;
  initialData?: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SuppliersModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: SuppliersModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    supplierCode: "",
    supplierName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    taxNumber: "",
    bankName: "",
    bankAccountNo: "",
    bankAccountHolder: "",
    paymentTermDays: 0,
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        supplierCode: initialData.supplierCode || "",
        supplierName: initialData.supplierName || "",
        contactPerson: initialData.contactPerson || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        taxNumber: initialData.taxNumber || "",
        bankName: initialData.bankName || "",
        bankAccountNo: initialData.bankAccountNo || initialData.bankAccount || "",
        bankAccountHolder: initialData.bankAccountHolder || initialData.bankHolder || "",
        paymentTermDays: Number(initialData.paymentTermDays || 0),
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        supplierCode: "",
        supplierName: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        taxNumber: "",
        bankName: "",
        bankAccountNo: "",
        bankAccountHolder: "",
        paymentTermDays: 0,
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierCode.trim() || !formData.supplierName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama supplier wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierCode: formData.supplierCode.trim().toUpperCase(),
        supplierName: formData.supplierName.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        taxNumber: formData.taxNumber.trim() || undefined,
        bankName: formData.bankName.trim() || undefined,
        bankAccountNo: formData.bankAccountNo.trim() || undefined,
        bankAccountHolder: formData.bankAccountHolder.trim() || undefined,
        paymentTermDays: Number(formData.paymentTermDays),
        isActive: formData.isActive as "Y" | "N",
      };

      if (isEdit && initialData) {
        await suppliersService.update(initialData.supplierId, payload);
        showSuccessAlert("Berhasil Diperbarui", "Data supplier berhasil disimpan.");
      } else {
        await suppliersService.create(payload);
        showSuccessAlert("Berhasil Dibuat", "Supplier baru berhasil ditambahkan.");
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
      title={isEdit ? "Edit Data Supplier" : "Tambah Supplier Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Supplier <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: SUPP-001"
              value={formData.supplierCode}
              onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value.toUpperCase() })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono uppercase text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Supplier / Perusahaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: PT Sumber Makmur Jaya"
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kontak PIC (Person in Charge)
            </label>
            <input
              type="text"
              placeholder="Misal: Hendra Gunawan"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nomor Telepon
            </label>
            <input
              type="text"
              placeholder="Misal: 021-5551234 / 0812345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Email
            </label>
            <input
              type="email"
              placeholder="Misal: sales@sumbermakmur.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              NPWP / Tax Number
            </label>
            <input
              type="text"
              placeholder="Misal: 01.234.567.8-012.000"
              value={formData.taxNumber}
              onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Tempo Pembayaran (Hari)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0 untuk tunai/COD"
              value={formData.paymentTermDays}
              onChange={(e) => setFormData({ ...formData, paymentTermDays: Number(e.target.value) })}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Bank
            </label>
            <input
              type="text"
              placeholder="BCA, Mandiri, BRI..."
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              No. Rekening
            </label>
            <input
              type="text"
              placeholder="1234567890"
              value={formData.bankAccountNo}
              onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Atas Nama (Pemilik)
            </label>
            <input
              type="text"
              placeholder="PT Sumber Makmur Jaya"
              value={formData.bankAccountHolder}
              onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
            Alamat Kantor / Gudang Supplier
          </label>
          <textarea
            rows={2}
            placeholder="Alamat lengkap supplier..."
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
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Supplier"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
