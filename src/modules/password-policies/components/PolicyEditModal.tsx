"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, Sliders, MessageSquare, Tag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormGroup } from "@/components/forms/FormGroup";
import { FormInput } from "@/components/forms/FormInput";
import type { PasswordPolicy } from "@/types";

export interface PolicyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: PasswordPolicy | null;
  onSubmit: (data: { value: string; message: string }) => Promise<void>;
}

export function PolicyEditModal({ isOpen, onClose, policy, onSubmit }: PolicyEditModalProps) {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (policy) {
      setValue(policy.value);
      setMessage(policy.message);
    }
  }, [policy, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ value, message });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isBoolean = policy?.code?.startsWith("REQUIRE_") || value === "0" || value === "1";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Kebijakan Kata Sandi"
      description={`Konfigurasi parameter aturan keamanan ${policy?.code || ""}`}
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
            Simpan Perubahan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Dynamic Preview Card */}
        <div className="flex items-center gap-3.5 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-galaxy-border/70 dark:bg-galaxy-input/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-400/15 text-primary-400 font-semibold text-xs ring-2 ring-primary-400/25">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate font-heading">
              {policy?.code}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-galaxy-muted">
              Nilai Parameter: <strong className="text-primary-400 font-mono">{value || policy?.value}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup label="Kode Kebijakan (System Identifier)" helperText="Nama unik parameter validasi">
            <FormInput
              value={policy?.code || ""}
              disabled
              leftIcon={<Tag className="h-4 w-4" />}
              className="bg-slate-100 dark:bg-galaxy-input opacity-70 font-mono"
            />
          </FormGroup>

          <FormGroup
            label="Nilai Parameter (Value)"
            required
            helperText={isBoolean ? "Gunakan 1 (aktif/wajib) atau 0 (non-aktif)" : "Gunakan angka integer (misal: 8)"}
          >
            <FormInput
              placeholder="cth: 8 (panjang) atau 1 (aktif)"
              leftIcon={<Sliders className="h-4 w-4" />}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormGroup>

          <div className="sm:col-span-2">
            <FormGroup
              label="Pesan Validasi / Instruksi Pengguna"
              required
              helperText="Teks panduan yang ditampilkan kepada user saat input kata sandi tidak valid"
            >
              <FormInput
                placeholder="cth: Kata sandi minimal 8 karakter"
                leftIcon={<MessageSquare className="h-4 w-4" />}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </FormGroup>
          </div>
        </div>
      </div>
    </Modal>
  );
}
