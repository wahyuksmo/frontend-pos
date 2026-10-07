"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { kitchenStationsService, outletsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { KitchenStation, Outlet } from "@/types";

export interface KitchenStationsModalProps {
  isOpen: boolean;
  initialData?: KitchenStation | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function KitchenStationsModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: KitchenStationsModalProps) {
  const isEdit = Boolean(initialData);

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [formData, setFormData] = useState({
    outletId: "",
    stationCode: "",
    stationName: "",
    printerType: "NETWORK",
    printerIp: "",
    printerPort: 9100,
    isKdsEnabled: "N",
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
        stationCode: initialData.stationCode || "",
        stationName: initialData.stationName || "",
        printerType: initialData.printerType || "NETWORK",
        printerIp: initialData.printerIp || "",
        printerPort: initialData.printerPort || 9100,
        isKdsEnabled: initialData.isKdsEnabled || "N",
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        outletId: outlets[0]?.outletId || "",
        stationCode: "",
        stationName: "",
        printerType: "NETWORK",
        printerIp: "",
        printerPort: 9100,
        isKdsEnabled: "N",
        isActive: "Y",
      });
    }
  }, [initialData, isOpen, outlets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.outletId) {
      showErrorAlert("Validasi Gagal", "Outlet wajib dipilih.");
      return;
    }
    if (!formData.stationCode.trim() || !formData.stationName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama Station wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && initialData) {
        await kitchenStationsService.update(initialData.stationId, formData as any);
        showSuccessAlert("Berhasil Diperbarui", "Data station berhasil disimpan.");
      } else {
        await kitchenStationsService.create(formData as any);
        showSuccessAlert("Berhasil Ditambahkan", "Data station baru berhasil dibuat.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const outletOptions = outlets.map((o) => ({
    value: o.outletId,
    label: `${o.outletCode} - ${o.outletName}`,
  }));

  const printerTypeOptions = [
    { value: "NETWORK", label: "Network LAN (TCP/IP)" },
    { value: "BLUETOOTH", label: "Bluetooth" },
    { value: "USB", label: "USB Langsung" },
    { value: "NONE", label: "Tanpa Printer (Hanya Layar KDS)" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Kitchen Station" : "Tambah Kitchen Station"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
            Outlet / Cabang <span className="text-rose-500">*</span>
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
              Kode Station <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: KS-BAR, KS-KITCHEN"
              value={formData.stationCode}
              onChange={(e) => setFormData((prev) => ({ ...prev, stationCode: e.target.value.toUpperCase() }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Station <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Bar Minuman, Dapur Masak"
              value={formData.stationName}
              onChange={(e) => setFormData((prev) => ({ ...prev, stationName: e.target.value }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Tipe Printer
            </label>
            <SearchableSelect
              options={printerTypeOptions}
              value={formData.printerType}
              onChange={(val) => setFormData((prev) => ({ ...prev, printerType: val }))}
              placeholder="Pilih Tipe Printer..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              IP Printer (Network)
            </label>
            <input
              type="text"
              placeholder="Misal: 192.168.1.200"
              value={formData.printerIp}
              onChange={(e) => setFormData((prev) => ({ ...prev, printerIp: e.target.value }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Port Printer
            </label>
            <input
              type="number"
              placeholder="9100"
              value={formData.printerPort}
              onChange={(e) => setFormData((prev) => ({ ...prev, printerPort: Number(e.target.value) }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Dukungan KDS (Kitchen Display System)
            </label>
            <SearchableSelect
              options={[
                { value: "Y", label: "Aktif (Tampilkan di Layar KDS)" },
                { value: "N", label: "Nonaktif" },
              ]}
              value={formData.isKdsEnabled}
              onChange={(val) => setFormData((prev) => ({ ...prev, isKdsEnabled: val }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Station
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
            {isEdit ? "Simpan Perubahan" : "Tambah Station"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
