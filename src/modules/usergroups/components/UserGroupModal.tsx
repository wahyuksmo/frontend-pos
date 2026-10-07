"use client";

import React, { useState, useEffect } from "react";
import { Shield, Key, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormGroup } from "@/components/forms/FormGroup";
import { FormInput } from "@/components/forms/FormInput";
import type { UserGroup } from "@/types";

export interface UserGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { usergroupCode: string; usergroupName: string }) => Promise<void>;
  group?: UserGroup | null;
}

export function UserGroupModal({ isOpen, onClose, onSubmit, group }: UserGroupModalProps) {
  const isEditing = Boolean(group);
  const [formData, setFormData] = useState({
    usergroupCode: "",
    usergroupName: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (group) {
      setFormData({
        usergroupCode: group.usergroupCode,
        usergroupName: group.usergroupName,
      });
    } else {
      setFormData({
        usergroupCode: "",
        usergroupName: "",
      });
    }
  }, [group, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit User Group: ${group?.usergroupCode}` : "Tambah User Group / Role Baru"}
      description="Konfigurasi peran dan wewenang hak akses otorisasi sistem."
      maxWidth="xl"
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
            disabled={submitting}
          >
            {isEditing ? "Simpan Perubahan" : "Simpan Role"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Dynamic Role Preview Card */}
        <div className="flex items-center gap-3.5 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-galaxy-border/70 dark:bg-galaxy-input/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-400/15 text-primary-400 font-semibold text-xs ring-2 ring-primary-400/25">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate font-heading">
              {formData.usergroupName || "Nama User Group Baru"}
            </h4>
            <p className="text-[11px] text-primary-400 font-mono">
              {formData.usergroupCode || "KODE_ROLE"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup
            label="Kode Role (Huruf Besar & Unik)"
            required={!isEditing}
            helperText="Digunakan sebagai identifier sistem otorisasi"
          >
            <FormInput
              placeholder="cth: SALES_ADMIN"
              leftIcon={<Key className="h-4 w-4" />}
              value={formData.usergroupCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usergroupCode: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                })
              }
              disabled={isEditing}
              className={isEditing ? "opacity-60 bg-slate-100 font-mono dark:bg-galaxy-input" : "font-mono"}
            />
          </FormGroup>

          <FormGroup
            label="Nama Role / User Group"
            required
            helperText="Nama tampilan peran yang mudah dipahami"
          >
            <FormInput
              placeholder="cth: Administrator Penjualan"
              leftIcon={<FileText className="h-4 w-4" />}
              value={formData.usergroupName}
              onChange={(e) => setFormData({ ...formData, usergroupName: e.target.value })}
            />
          </FormGroup>
        </div>
      </div>
    </Modal>
  );
}
