"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Shield, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { approvalsService } from "@/services";
import type { ApprovalTemplate, ApproverType, ApprovalLookups, SelectOption } from "@/types";

export interface ApprovalTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  template: ApprovalTemplate | null;
  lookups?: ApprovalLookups | null;
}

interface StepFormItem {
  stepOrder: number;
  stepName: string;
  approverType: ApproverType;
  usergroupId?: string;
  userId?: string;
  canRevise: string;
}

export function ApprovalTemplateModal({
  isOpen,
  onClose,
  onSubmit,
  template,
  lookups: initialLookups,
}: ApprovalTemplateModalProps) {
  const [lookups, setLookups] = useState<ApprovalLookups | null>(initialLookups || null);
  const [templateCode, setTemplateCode] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [objectCode, setObjectCode] = useState("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [description, setDescription] = useState("");

  const [steps, setSteps] = useState<StepFormItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lookups dynamically from API
  useEffect(() => {
    if (isOpen) {
      if (!initialLookups) {
        approvalsService
          .getLookups()
          .then((res) => {
            if (res.data) setLookups(res.data);
          })
          .catch(() => {});
      } else {
        setLookups(initialLookups);
      }
    }
  }, [isOpen, initialLookups]);

  // Synchronize form state on open / template change
  useEffect(() => {
    if (!isOpen) return;

    if (template) {
      setTemplateCode(template.templateCode);
      setTemplateName(template.templateName);
      setObjectCode(template.objectCode);
      setMinAmount(template.minAmount != null ? String(template.minAmount) : "");
      setMaxAmount(template.maxAmount != null ? String(template.maxAmount) : "");
      setDescription(template.description || "");

      if (template.details && template.details.length > 0) {
        setSteps(
          template.details.map((d, idx) => ({
            stepOrder: idx + 1,
            stepName: d.stepName,
            approverType: d.approverType,
            usergroupId: d.usergroupId || "",
            userId: d.userId || "",
            canRevise: d.canRevise || "Y",
          }))
        );
      } else {
        setSteps([
          {
            stepOrder: 1,
            stepName: "Review Atasan Langsung",
            approverType: "DIRECT_MANAGER",
            canRevise: "Y",
          },
        ]);
      }
    } else {
      setTemplateCode("");
      setTemplateName("");
      setObjectCode(lookups?.modules?.[0]?.value || "");
      setMinAmount("");
      setMaxAmount("");
      setDescription("");
      setSteps([
        {
          stepOrder: 1,
          stepName: "Review Atasan Langsung",
          approverType: "DIRECT_MANAGER",
          canRevise: "Y",
        },
        {
          stepOrder: 2,
          stepName: "Approval Role",
          approverType: "ROLE",
          usergroupId: lookups?.usergroups?.[0]?.value || "",
          canRevise: "Y",
        },
      ]);
    }
    setError(null);
  }, [isOpen, template, lookups]);

  // Options for Select2 (SearchableSelect)
  const moduleOptions: SelectOption[] = lookups?.modules || [];
  const approverTypeOptions: SelectOption[] = lookups?.approverTypes || [
    { value: "DIRECT_MANAGER", label: "Atasan Langsung (Dinamis)" },
    { value: "ROLE", label: "Role / User Group" },
    { value: "SPECIFIC_USER", label: "User Tertentu" },
  ];
  const usergroupOptions: SelectOption[] = lookups?.usergroups || [];
  const userOptions: SelectOption[] = lookups?.users || [];

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        stepOrder: prev.length + 1,
        stepName: `Langkah Persetujuan ${prev.length + 1}`,
        approverType: "ROLE",
        usergroupId: usergroupOptions[0]?.value || "",
        canRevise: "Y",
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      setError("Template alur alur persetujuan wajib memiliki minimal 1 langkah.");
      return;
    }
    setSteps((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((s, idx) => ({ ...s, stepOrder: idx + 1 }))
    );
  };

  const handleStepChange = (index: number, field: keyof StepFormItem, value: any) => {
    setSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setSteps(
      updated.map((s, idx) => ({
        ...s,
        stepOrder: idx + 1,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!templateCode.trim()) {
      setError("Kode template wajib diisi.");
      return;
    }
    if (!objectCode) {
      setError("Modul target objek wajib dipilih.");
      return;
    }
    if (!templateName.trim()) {
      setError("Nama template alur persetujuan wajib diisi.");
      return;
    }
    if (!steps.length) {
      setError("Minimal harus ada satu langkah alur persetujuan.");
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (!s.stepName.trim()) {
        setError(`Nama langkah ke-${i + 1} wajib diisi.`);
        return;
      }
      if (s.approverType === "ROLE" && !s.usergroupId) {
        setError(`Role pada langkah ke-${i + 1} wajib dipilih.`);
        return;
      }
      if (s.approverType === "SPECIFIC_USER" && !s.userId) {
        setError(`Pengguna spesifik pada langkah ke-${i + 1} wajib dipilih.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        templateCode: templateCode.trim().toUpperCase(),
        templateName: templateName.trim(),
        objectCode,
        minAmount: minAmount !== "" ? Number(minAmount) : null,
        maxAmount: maxAmount !== "" ? Number(maxAmount) : null,
        description: description.trim() || null,
        details: steps.map((s, idx) => ({
          stepOrder: idx + 1,
          stepName: s.stepName,
          approverType: s.approverType,
          usergroupId: s.approverType === "ROLE" ? s.usergroupId : null,
          userId: s.approverType === "SPECIFIC_USER" ? s.userId : null,
          canRevise: s.canRevise,
        })),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan template approval.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = !!template;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Template Approval" : "Tambah Template Approval"}
      description="Konfigurasi modul objek, batas nominal, dan tahapan berjenjang alur persetujuan."
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
            className="shadow-galaxy-cyan"
          >
            {isEdit ? "Simpan Perubahan" : "Tambah Template"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kode Template */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              <span>Kode Template</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              placeholder="Contoh: TPL-REIMB-TIER1"
              value={templateCode}
              onChange={(e) => setTemplateCode(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 disabled:opacity-60 font-mono uppercase transition-colors"
            />
          </div>

          {/* Modul Target Objek (Select2 SearchableSelect) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              <span>Modul Target Objek</span>
              <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              size="sm"
              options={moduleOptions}
              value={objectCode}
              onChange={(val) => setObjectCode(val)}
              placeholder="Pilih modul target objek..."
              searchPlaceholder="Cari modul..."
              clearable={false}
            />
          </div>

          {/* Nama Template */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              <span>Nama Template</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Approval Diskon Penjualan Khusus (> 20%)"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
            />
          </div>

          {/* Minimal Nominal */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              <span>Minimal Nominal (Rp)</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
            />
            <span className="text-[10px] text-slate-400">Kosongkan jika tanpa batas minimal</span>
          </div>

          {/* Maksimal Nominal */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              <span>Maksimal Nominal (Rp)</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="5000000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
            />
            <span className="text-[10px] text-slate-400">Kosongkan jika tanpa batas maksimal</span>
          </div>

          {/* Deskripsi */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              <span>Keterangan / Deskripsi</span>
            </label>
            <textarea
              rows={2}
              placeholder="Deskripsi alur alur persetujuan ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Step Configuration */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-galaxy-border/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-heading">
                <Shield className="h-3.5 w-3.5 text-primary-400" />
                <span>Tahapan Persetujuan ({steps.length} Langkah)</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Persetujuan diproses secara berurutan sesuai nomor urutan langkah alur.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStep}
              className="gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Langkah</span>
            </Button>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {steps.map((step, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/70 dark:border-galaxy-border/80 dark:bg-galaxy-card/60 relative group"
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary-400 text-slate-950 font-bold text-[10px]">
                      {step.stepOrder}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-heading">
                      Langkah #{step.stepOrder}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveStep(index, "up")}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-200 dark:hover:bg-galaxy-hover"
                      title="Pindah ke Atas"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === steps.length - 1}
                      onClick={() => handleMoveStep(index, "down")}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-200 dark:hover:bg-galaxy-hover"
                      title="Pindah ke Bawah"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-1 text-rose-500 hover:text-rose-600 rounded hover:bg-rose-500/10"
                      title="Hapus Langkah"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Nama Tahap */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Nama Tahap
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Review Manager"
                      value={step.stepName}
                      onChange={(e) => handleStepChange(index, "stepName", e.target.value)}
                      className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
                    />
                  </div>

                  {/* Tipe Approver (Select2 SearchableSelect) */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Tipe Approver
                    </label>
                    <SearchableSelect
                      size="sm"
                      options={approverTypeOptions}
                      value={step.approverType}
                      onChange={(val) =>
                        handleStepChange(index, "approverType", val as ApproverType)
                      }
                      placeholder="Pilih tipe..."
                      searchPlaceholder="Cari tipe..."
                      clearable={false}
                    />
                  </div>

                  {/* Target Approver Berdasarkan Tipe */}
                  <div className="space-y-1">
                    {step.approverType === "ROLE" ? (
                      <>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          Pilih Role / Group
                        </label>
                        <SearchableSelect
                          size="sm"
                          options={usergroupOptions}
                          value={step.usergroupId || ""}
                          onChange={(val) => handleStepChange(index, "usergroupId", val)}
                          placeholder="Pilih role / user group..."
                          searchPlaceholder="Cari role..."
                          clearable={false}
                        />
                      </>
                    ) : step.approverType === "SPECIFIC_USER" ? (
                      <>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          Pilih User Spesifik
                        </label>
                        <SearchableSelect
                          size="sm"
                          options={userOptions}
                          value={step.userId || ""}
                          onChange={(val) => handleStepChange(index, "userId", val)}
                          placeholder="Pilih pengguna..."
                          searchPlaceholder="Cari nama pengguna..."
                          clearable={false}
                        />
                      </>
                    ) : (
                      <div className="flex items-center h-full pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
                          <input
                            type="checkbox"
                            checked={step.canRevise === "Y"}
                            onChange={(e) =>
                              handleStepChange(index, "canRevise", e.target.checked ? "Y" : "N")
                            }
                            className="rounded border-slate-300 text-primary-400 focus:ring-primary-400 h-4 w-4"
                          />
                          <span>Bisa Minta Revisi</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional option: Can revise checkbox for ROLE and SPECIFIC_USER */}
                {step.approverType !== "DIRECT_MANAGER" && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-galaxy-border/50 flex items-center justify-end">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={step.canRevise === "Y"}
                        onChange={(e) =>
                          handleStepChange(index, "canRevise", e.target.checked ? "Y" : "N")
                        }
                        className="rounded border-slate-300 text-primary-400 focus:ring-primary-400 h-3.5 w-3.5"
                      />
                      <span className="text-[11px]">Izinkan approver meminta revisi berkas</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

