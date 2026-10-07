"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { salesChannelsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { SalesChannel } from "@/types";

export interface SalesChannelsModalProps {
  isOpen: boolean;
  initialData?: SalesChannel | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SalesChannelsModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: SalesChannelsModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    channelCode: "",
    channelName: "",
    orderType: "DINE_IN",
    priceMarkupPercent: 0,
    platformCommissionPercent: 0,
    autoAcceptOrder: "N",
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        channelCode: initialData.channelCode || "",
        channelName: initialData.channelName || "",
        orderType: initialData.orderType || "DINE_IN",
        priceMarkupPercent: Number(initialData.priceMarkupPercent) || 0,
        platformCommissionPercent: Number(initialData.platformCommissionPercent) || 0,
        autoAcceptOrder: initialData.autoAcceptOrder || "N",
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        channelCode: "",
        channelName: "",
        orderType: "DINE_IN",
        priceMarkupPercent: 0,
        platformCommissionPercent: 0,
        autoAcceptOrder: "N",
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.channelCode.trim() || !formData.channelName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama Saluran Penjualan wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        priceMarkupPercent: Number(formData.priceMarkupPercent),
        platformCommissionPercent: Number(formData.platformCommissionPercent),
      };

      if (isEdit && initialData) {
        await salesChannelsService.update(initialData.channelId, payload as any);
        showSuccessAlert("Berhasil Diperbarui", "Data saluran penjualan berhasil disimpan.");
      } else {
        await salesChannelsService.create(payload as any);
        showSuccessAlert("Berhasil Ditambahkan", "Saluran penjualan baru berhasil dibuat.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const orderTypeOptions = [
    { value: "DINE_IN", label: "Dine-In (Makan di Tempat)" },
    { value: "TAKEAWAY", label: "Takeaway (Bungkus / Bawa Pulang)" },
    { value: "DELIVERY", label: "Delivery (Kurir Internal / Ojol)" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Saluran Penjualan" : "Tambah Saluran Penjualan"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Channel <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: GOFOOD, GRABFOOD, DINE_IN"
              value={formData.channelCode}
              onChange={(e) => setFormData((prev) => ({ ...prev, channelCode: e.target.value.toUpperCase() }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Channel <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: GoFood Online Delivery"
              value={formData.channelName}
              onChange={(e) => setFormData((prev) => ({ ...prev, channelName: e.target.value }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
            Tipe Order Dasar
          </label>
          <SearchableSelect
            options={orderTypeOptions}
            value={formData.orderType}
            onChange={(val) => setFormData((prev) => ({ ...prev, orderType: val }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Markup Harga Jual (%)
            </label>
            <input
              type="number"
              step="any"
              placeholder="Misal: 20 (harga naik 20%)"
              value={formData.priceMarkupPercent}
              onChange={(e) => setFormData((prev) => ({ ...prev, priceMarkupPercent: Number(e.target.value) }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Komisi Potongan Platform (%)
            </label>
            <input
              type="number"
              step="any"
              placeholder="Misal: 20 (bagi hasil ojol 20%)"
              value={formData.platformCommissionPercent}
              onChange={(e) => setFormData((prev) => ({ ...prev, platformCommissionPercent: Number(e.target.value) }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Otomatis Terima Order?
            </label>
            <SearchableSelect
              options={[
                { value: "Y", label: "Otomatis Terima & Cetak Dapur" },
                { value: "N", label: "Manual (Perlu Konfirmasi Kasir)" },
              ]}
              value={formData.autoAcceptOrder}
              onChange={(val) => setFormData((prev) => ({ ...prev, autoAcceptOrder: val }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Channel
            </label>
            <SearchableSelect
              options={[
                { value: "Y", label: "Aktif" },
                { value: "N", label: "Nonaktif" },
              ]}
              value={formData.isActive}
              onChange={(val) => setFormData((prev) => ({ ...prev, isActive: val }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-galaxy-border/40">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={submitting} className="shadow-galaxy-cyan">
            {isEdit ? "Simpan Perubahan" : "Tambah Channel"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
