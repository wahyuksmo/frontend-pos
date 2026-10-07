"use client";

import React, { useState, useEffect, useMemo } from "react";
import { User, Mail, Phone, Shield, UserCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormGroup } from "@/components/forms/FormGroup";
import { FormInput } from "@/components/forms/FormInput";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { showErrorAlert } from "@/lib/sweetalert";
import type { UserGroup, User as UserType, SelectOption } from "@/types";

export interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<UserType>) => Promise<void>;
  user: UserType | null;
  usergroups: UserGroup[];
}

export function UserEditModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  usergroups,
}: UserEditModalProps) {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    usergroupId: "",
    isActive: "Y" as "Y" | "N",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert usergroups to Select2 SelectOption
  const usergroupOptions: SelectOption[] = useMemo(() => {
    return usergroups.map((g) => ({
      value: g.usergroupId,
      label: `${g.usergroupName} (${g.usergroupCode})`,
    }));
  }, [usergroups]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
        phone: user.phone || "",
        usergroupId: user.usergroupId || "",
        isActive: user.isActive,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.fullname.trim()) {
      showErrorAlert("Validasi Gagal", "Nama Lengkap wajib diisi.");
      return;
    }
    if (!formData.usergroupId) {
      showErrorAlert("Validasi Gagal", "Pilih User Group / Role untuk pengguna.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(user.userId, formData);
      onClose();
    } catch {
      // Handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedGroup = usergroups.find((g) => g.usergroupId === formData.usergroupId);

  const initials = formData.fullname
    ? formData.fullname.substring(0, 2).toUpperCase()
    : user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "US";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Data Pengguna"
      description={`Perbarui profil dan wewenang akun @${user?.username || ""}`}
      maxWidth="3xl"
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
        {/* Dynamic User Profile Header */}
        <div className="flex items-center gap-3.5 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-galaxy-border/70 dark:bg-galaxy-input/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-400/15 text-primary-400 font-semibold text-xs ring-2 ring-primary-400/25 font-heading">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate font-heading">
              {formData.fullname || user?.fullname}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500 dark:text-galaxy-muted font-mono">
                @{user?.username}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] font-medium text-primary-400 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {selectedGroup?.usergroupName || "Role"}
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
            formData.isActive === "Y"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
          }`}>
            {formData.isActive === "Y" ? "Akun Aktif" : "Non-Aktif"}
          </span>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Nama Lengkap" required helperText="Nama lengkap profil akun">
            <FormInput
              placeholder="cth: John Doe"
              leftIcon={<UserCheck className="h-4 w-4" />}
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Alamat Email" helperText="Email pengguna">
            <FormInput
              type="email"
              placeholder="john@pos.local"
              leftIcon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Nomor Telepon" helperText="Kontak telepon seluler">
            <FormInput
              placeholder="0812xxxxxxxx"
              leftIcon={<Phone className="h-4 w-4" />}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </FormGroup>

          {/* User Group with Select2 */}
          <FormGroup label="User Group / Role Akses" required helperText="Peran otoritas pengguna">
            <SearchableSelect
              options={usergroupOptions}
              value={formData.usergroupId}
              onChange={(val) => setFormData({ ...formData, usergroupId: val })}
              placeholder="Pilih Role Pengguna..."
              searchPlaceholder="Ketik untuk mencari role..."
              clearable={false}
            />
          </FormGroup>
        </div>

        {/* Status Switch */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/30">
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-heading">
              Status Akun Aktif
            </div>
            <div className="text-[11px] text-slate-500 dark:text-galaxy-muted">
              Pengguna yang aktif dapat login ke dalam sistem menggunakan akun ini.
            </div>
          </div>
          <Switch
            checked={formData.isActive === "Y"}
            onChange={(checked) => setFormData({ ...formData, isActive: checked ? "Y" : "N" })}
          />
        </div>
      </div>
    </Modal>
  );
}
