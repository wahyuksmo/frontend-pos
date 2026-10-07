"use client";

import React, { useState } from "react";
import { Key, Tag, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormGroup } from "@/components/forms/FormGroup";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { showErrorAlert } from "@/lib/sweetalert";
import type { CreateSettingData } from "@/services/settings.service";

export interface SettingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSettingData) => Promise<void>;
}

const valueTypeOptions = [
  { value: "string", label: "String (Teks)" },
  { value: "number", label: "Number (Angka)" },
  { value: "boolean", label: "Boolean (True/False)" },
  { value: "json", label: "JSON (Struktur Objek)" },
];

export function SettingCreateModal({
  isOpen,
  onClose,
  onSubmit,
}: SettingCreateModalProps) {
  const [formData, setFormData] = useState<CreateSettingData>({
    settingKey: "",
    settingValue: "",
    valueType: "string",
    description: "",
    objectCode: "SETTING",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.settingKey.trim() || !formData.settingValue.trim()) {
      showErrorAlert("Validasi Gagal", "Setting Key dan Nilai Setting wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        settingKey: formData.settingKey.trim(),
        settingValue: formData.settingValue.trim(),
        valueType: formData.valueType || "string",
        description: formData.description?.trim() || undefined,
        objectCode: formData.objectCode?.trim() || "SETTING",
      });
      onClose();
      setFormData({
        settingKey: "",
        settingValue: "",
        valueType: "string",
        description: "",
        objectCode: "SETTING",
      });
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
      title="Tambah Pengaturan Sistem"
      description="Mendaftarkan parameter konfigurasi sistem baru ke database."
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
            Daftarkan Setting
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Setting Key */}
        <FormGroup label="Setting Key" required helperText="Gunakan format huruf kapital unik, misal: APP_SITE_NAME">
          <FormInput
            placeholder="Contoh: COMPANY_EMAIL"
            leftIcon={<Key className="h-4 w-4" />}
            value={formData.settingKey}
            onChange={(e) =>
              setFormData({ ...formData, settingKey: e.target.value.toUpperCase() })
            }
            required
            className="font-mono"
          />
        </FormGroup>

        {/* Setting Value */}
        <FormGroup label="Nilai Setting" required helperText="Isi nilai atau konfigurasi parameter">
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
              value={formData.valueType || "string"}
              onChange={(val) => setFormData({ ...formData, valueType: val })}
              clearable={false}
            />
          </FormGroup>

          <FormGroup label="Object Code">
            <FormInput
              placeholder="Default: SETTING"
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
        <FormGroup label="Deskripsi Pengaturan" helperText="Keterangan fungsi atau batasan pengaturan ini">
          <FormInput
            placeholder="Keterangan singkat..."
            leftIcon={<FileText className="h-4 w-4" />}
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </FormGroup>
      </div>
    </Modal>
  );
}
