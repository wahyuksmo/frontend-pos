"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { surchargesService, outletsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { Surcharge, Outlet } from "@/types";

export interface SurchargesModalProps {
  isOpen: boolean;
  initialData?: Surcharge | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SurchargesModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: SurchargesModalProps) {
  const isEdit = Boolean(initialData);

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [formData, setFormData] = useState({
    outletId: "",
    surchargeCode: "",
    surchargeName: "",
    surchargeType: "PERCENTAGE",
    rateValue: 5,
    isTaxable: "Y",
    applicableOrderType: "ALL",
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      outletsService.findAll({ limit: 100, isActive: "Y" }).then((res) => {
        setOutlets(res.data || []);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        outletId: initialData.outletId || "",
        surchargeCode: initialData.surchargeCode || "",
        surchargeName: initialData.surchargeName || "",
        surchargeType: initialData.surchargeType || "PERCENTAGE",
        rateValue: Number(initialData.rateValue) || 0,
        isTaxable: initialData.isTaxable || "Y",
        applicableOrderType: initialData.applicableOrderType || "ALL",
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        outletId: "",
        surchargeCode: "",
        surchargeName: "",
        surchargeType: "PERCENTAGE",
        rateValue: 5,
        isTaxable: "Y",
        applicableOrderType: "ALL",
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.surchargeCode.trim() || !formData.surchargeName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama Surcharge wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        outletId: formData.outletId || undefined,
        rateValue: Number(formData.rateValue),
      };

      if (isEdit && initialData) {
        await surchargesService.update(initialData.surchargeId, payload as any);
        showSuccessAlert("Berhasil Diperbarui", "Data surcharge berhasil disimpan.");
      } else {
        await surchargesService.create(payload as any);
        showSuccessAlert("Berhasil Ditambahkan", "Data surcharge baru berhasil dibuat.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const outletOptions = [
    { value: "", label: "Semua Cabang (Berlaku Global)" },
    ...outlets.map((o) => ({
      value: o.outletId,
      label: `${o.outletCode} - ${o.outletName}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Surcharge & Biaya" : "Tambah Surcharge Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
            Outlet Berlaku
          </label>
          <SearchableSelect
            options={outletOptions}
            value={formData.outletId}
            onChange={(val) => setFormData((prev) => ({ ...prev, outletId: val }))}
            placeholder="Pilih Outlet..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Surcharge <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: SC-5, BOX-FEE"
              value={formData.surchargeCode}
              onChange={(e) => setFormData((prev) => ({ ...prev, surchargeCode: e.target.value.toUpperCase() }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Surcharge <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Service Charge Resto 5%"
              value={formData.surchargeName}
              onChange={(e) => setFormData((prev) => ({ ...prev, surchargeName: e.target.value }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Tipe Perhitungan
            </label>
            <SearchableSelect
              options={[
                { value: "PERCENTAGE", label: "Persentase (%)" },
                { value: "FIXED_AMOUNT", label: "Nominal Tetap (Rp)" },
              ]}
              value={formData.surchargeType}
              onChange={(val) => setFormData((prev) => ({ ...prev, surchargeType: val }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nilai Rate / Nominal <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder={formData.surchargeType === "PERCENTAGE" ? "Misal: 5" : "Misal: 2000"}
              value={formData.rateValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, rateValue: Number(e.target.value) }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kena Pajak PB1?
            </label>
            <SearchableSelect
              options={[
                { value: "Y", label: "Ya (Kena Pajak Resto)" },
                { value: "N", label: "Tidak (Bebas Pajak)" },
              ]}
              value={formData.isTaxable}
              onChange={(val) => setFormData((prev) => ({ ...prev, isTaxable: val }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Berlaku Untuk Order
            </label>
            <SearchableSelect
              options={[
                { value: "ALL", label: "Semua Order" },
                { value: "DINE_IN", label: "Hanya Dine In" },
                { value: "TAKEAWAY", label: "Hanya Takeaway" },
                { value: "DELIVERY", label: "Hanya Delivery" },
              ]}
              value={formData.applicableOrderType}
              onChange={(val) => setFormData((prev) => ({ ...prev, applicableOrderType: val }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Surcharge
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
            {isEdit ? "Simpan Perubahan" : "Tambah Surcharge"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
