"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { unitConversionsService, unitsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { UnitConversion, Unit } from "@/types";

export interface UnitConversionsModalProps {
  isOpen: boolean;
  initialData?: UnitConversion | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UnitConversionsModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: UnitConversionsModalProps) {
  const isEdit = Boolean(initialData);

  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState({
    fromUnitId: "",
    toUnitId: "",
    multiplier: 1,
    isActive: "Y",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      unitsService.findAll({ limit: 100, isActive: "Y" }).then((res) => {
        setUnits(res.data || []);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fromUnitId: initialData.fromUnitId || "",
        toUnitId: initialData.toUnitId || "",
        multiplier: Number(initialData.multiplier) || 1,
        isActive: initialData.isActive || "Y",
      });
    } else {
      setFormData({
        fromUnitId: "",
        toUnitId: "",
        multiplier: 1,
        isActive: "Y",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromUnitId || !formData.toUnitId) {
      showErrorAlert("Validasi Gagal", "Satuan Asal dan Satuan Tujuan wajib dipilih.");
      return;
    }
    if (formData.fromUnitId === formData.toUnitId) {
      showErrorAlert("Validasi Gagal", "Satuan Asal dan Satuan Tujuan tidak boleh sama.");
      return;
    }
    if (Number(formData.multiplier) <= 0) {
      showErrorAlert("Validasi Gagal", "Nilai pengali harus lebih besar dari 0.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        multiplier: Number(formData.multiplier),
      };

      if (isEdit && initialData) {
        await unitConversionsService.update(initialData.conversionId, payload as any);
        showSuccessAlert("Berhasil Diperbarui", "Aturan konversi berhasil disimpan.");
      } else {
        await unitConversionsService.create(payload as any);
        showSuccessAlert("Berhasil Ditambahkan", "Aturan konversi baru berhasil dibuat.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const unitOptions = units.map((u) => ({
    value: u.unitId,
    label: `${u.unitName} (${u.unitCode})`,
  }));

  const selectedFromUnit = units.find((u) => u.unitId === formData.fromUnitId);
  const selectedToUnit = units.find((u) => u.unitId === formData.toUnitId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Konversi Satuan" : "Tambah Aturan Konversi Satuan"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              1 Satuan Asal (Satuan Lebih Besar) <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={unitOptions}
              value={formData.fromUnitId}
              onChange={(val) => setFormData((prev) => ({ ...prev, fromUnitId: val }))}
              placeholder="Pilih Satuan Asal (misal: Karung, Dus)..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Satuan Tujuan (Satuan Terkecil) <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={unitOptions}
              value={formData.toUnitId}
              onChange={(val) => setFormData((prev) => ({ ...prev, toUnitId: val }))}
              placeholder="Pilih Satuan Tujuan (misal: Kg, Gram)..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Faktor Pengali (Multiplier) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="Misal: 50 (jika 1 Karung = 50 Kg)"
              value={formData.multiplier}
              onChange={(e) => setFormData((prev) => ({ ...prev, multiplier: Number(e.target.value) }))}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Status Konversi
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

        {/* Live Formula Preview Box */}
        {selectedFromUnit && selectedToUnit && (
          <div className="rounded-lg border border-primary-400/30 bg-primary-400/5 p-3 text-xs text-slate-700 dark:text-slate-200">
            <div className="font-semibold text-primary-400 mb-1 font-heading">Rumus Konversi:</div>
            <div className="font-mono text-sm">
              1 {selectedFromUnit.unitName} = <span className="font-bold text-primary-400">{formData.multiplier}</span> {selectedToUnit.unitName} ({selectedToUnit.unitCode})
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-galaxy-border/40">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={submitting} className="shadow-galaxy-cyan">
            {isEdit ? "Simpan Perubahan" : "Tambah Konversi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
