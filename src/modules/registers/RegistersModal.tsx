"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { registersService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { Register, SelectOption } from "@/types";

export interface RegistersModalProps {
  isOpen: boolean;
  initialData?: Register | null;
  outletOptions: SelectOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function RegistersModal({
  isOpen,
  initialData,
  outletOptions,
  onClose,
  onSuccess,
}: RegistersModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    outletId: "",
    registerCode: "",
    registerName: "",
    macAddress: "",
    ipAddress: "",
    notes: "",
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        outletId: initialData.outletId || "",
        registerCode: initialData.registerCode || "",
        registerName: initialData.registerName || "",
        macAddress: initialData.macAddress || "",
        ipAddress: initialData.ipAddress || "",
        notes: initialData.notes || "",
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        outletId: outletOptions[0]?.value || "",
        registerCode: "",
        registerName: "",
        macAddress: "",
        ipAddress: "",
        notes: "",
        isActive: "Y",
      });
    }
  }, [initialData, isOpen, outletOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.outletId) {
      showErrorAlert("Validasi Gagal", "Cabang outlet wajib dipilih.");
      return;
    }
    if (!formData.registerCode.trim() || !formData.registerName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama Register wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && initialData) {
        await registersService.update(initialData.registerId, formData as any);
        showSuccessAlert("Berhasil Diperbarui", "Data register berhasil disimpan.");
      } else {
        await registersService.create(formData as any);
        showSuccessAlert("Berhasil Dibuat", "Register kasir baru berhasil ditambahkan.");
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
      title={isEdit ? "Edit Terminal Kasir" : "Tambah Terminal Kasir Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Cabang Outlet <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              size="sm"
              options={outletOptions}
              value={formData.outletId}
              onChange={(val) => setFormData({ ...formData, outletId: val })}
              placeholder="Pilih Outlet..."
              clearable={false}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Kode Register <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: REG-01"
              value={formData.registerCode}
              onChange={(e) => setFormData({ ...formData, registerCode: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Nama Register <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kasir Utama Lt 1"
              value={formData.registerName}
              onChange={(e) => setFormData({ ...formData, registerName: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              IP Address
            </label>
            <input
              type="text"
              placeholder="Contoh: 192.168.1.101"
              value={formData.ipAddress}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              MAC Address
            </label>
            <input
              type="text"
              placeholder="Contoh: 00:1B:44:11:3A:B7"
              value={formData.macAddress}
              onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Catatan / Lokasi Fisik
            </label>
            <input
              type="text"
              placeholder="Contoh: Mesin POS touchscreen dekat pintu keluar"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Register
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
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Register"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
