"use client";

import React, { useState, useEffect } from "react";
import { Key, Tag, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormGroup } from "@/components/forms/FormGroup";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { showErrorAlert } from "@/lib/sweetalert";
import type { SystemSetting } from "@/types";

export interface SettingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<SystemSetting>) => Promise<void>;
  setting: SystemSetting | null;
}

const valueTypeOptions = [
  { value: "string", label: "String (Teks)" },
  { value: "number", label: "Number (Angka)" },
  { value: "boolean", label: "Boolean (True/False)" },
  { value: "json", label: "JSON (Struktur Objek)" },
];

export function SettingEditModal({
  isOpen,
  onClose,
  onSubmit,
  setting,
}: SettingEditModalProps) {
  const [formData, setFormData] = useState({
    settingValue: "",
    valueType: "string",
    description: "",
    objectCode: "SETTING",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (setting) {
      setFormData({
        settingValue: setting.settingValue || "",
        valueType: setting.valueType || "string",
        description: setting.description || "",
        objectCode: setting.objectCode || "SETTING",
      });
    }
  }, [setting, isOpen]);

  if (!setting) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.settingValue.trim()) {
      showErrorAlert("Validasi Gagal", "Nilai Setting tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(setting.settingId, {
        settingValue: formData.settingValue.trim(),
        valueType: formData.valueType,
        description: formData.description.trim() || undefined,
        objectCode: formData.objectCode.trim() || "SETTING",
      });
      onClose();
    } catch {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Pengaturan Sistem"
      description="Perbarui nilai atau metadata konfigurasi sistem."
      maxWidth="xl"
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Simpan Perubahan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Setting Key (Disabled/Read-only) */}
        <FormGroup label="Setting Key" helperText="Kunci identitas bersifat permanen dan tidak dapat diubah">
          <FormInput
            value={setting.settingKey}
            disabled
            leftIcon={<Key className="h-4 w-4" />}
            className="font-mono bg-slate-100 dark:bg-galaxy-input opacity-70"
          />
        </FormGroup>

        {/* Setting Value */}
        <FormGroup label="Nilai Setting" required helperText="Nilai parameter baru yang akan diterapkan">
          <FormTextarea
            rows={3}
            placeholder="Masukkan nilai setting..."
            value={formData.settingValue}
            onChange={(e) => setFormData({ ...formData, settingValue: e.target.value })}
            required
            className="font-mono"
          />
        </FormGroup>

        {/* Value Type & Object Code Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Tipe Data">
            <SearchableSelect
              options={valueTypeOptions}
              value={formData.valueType}
              onChange={(val) => setFormData({ ...formData, valueType: val })}
              clearable={false}
            />
          </FormGroup>

          <FormGroup label="Object Code">
            <FormInput
              leftIcon={<Tag className="h-4 w-4" />}
              value={formData.objectCode || ""}
              onChange={(e) =>
                setFormData({ ...formData, objectCode: e.target.value.toUpperCase() })
              }
              className="font-mono"
            />
          </FormGroup>
        </div>

        {/* Description */}
        <FormGroup label="Deskripsi Pengaturan" helperText="Keterangan singkat fungsi pengaturan ini">
          <FormInput
            placeholder="Keterangan..."
            leftIcon={<FileText className="h-4 w-4" />}
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </FormGroup>
      </div>
    </Modal>
  );
}
