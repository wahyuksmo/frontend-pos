"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import {
  ApprovalTemplateFilter,
  ApprovalTemplateTable,
  ApprovalTemplateModal,
} from "@/modules/approvals";
import { approvalsService } from "@/services";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
  showLoadingAlert,
  closeAlert,
} from "@/lib/sweetalert";
import type { ApprovalLookups, ApprovalTemplate, PaginationMeta } from "@/types";

export default function ApprovalTemplatesPage() {
  const [templates, setTemplates] = useState<ApprovalTemplate[]>([]);
  const [lookups, setLookups] = useState<ApprovalLookups | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [objectCode, setObjectCode] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ApprovalTemplate | null>(null);

  // Load dynamic lookups from API (modules, usergroups, users)
  useEffect(() => {
    approvalsService
      .getLookups()
      .then((res) => {
        if (res.data) setLookups(res.data);
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await approvalsService.getTemplates({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        objectCode: objectCode || undefined,
      });
      setTemplates(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Gagal memuat template approval.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, objectCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: ApprovalTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (formData: any) => {
    if (selectedTemplate) {
      showLoadingAlert("Memperbarui...", "Menyimpan perubahan template approval...");
      try {
        await approvalsService.updateTemplate(selectedTemplate.templateId, formData);
        closeAlert();
        await showSuccessAlert("Berhasil!", "Template approval berhasil diperbarui.");
        fetchData();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Memperbarui", err.message || "Gagal memperbarui template.");
        throw err;
      }
    } else {
      showLoadingAlert("Menyimpan...", "Membuat template approval baru...");
      try {
        await approvalsService.createTemplate(formData);
        closeAlert();
        await showSuccessAlert("Berhasil!", "Template approval baru berhasil dibuat.");
        fetchData();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Menyimpan", err.message || "Gagal membuat template approval.");
        throw err;
      }
    }
  };

  const handleDelete = async (template: ApprovalTemplate) => {
    const confirm = await showConfirmDialog({
      title: "Hapus Template Approval?",
      text: `Apakah Anda yakin ingin menghapus template '${template.templateName}' (${template.templateCode})?`,
      isDanger: true,
    });

    if (confirm.isConfirmed) {
      showLoadingAlert("Menghapus...", "Sedang menghapus template...");
      try {
        await approvalsService.deleteTemplate(template.templateId);
        closeAlert();
        await showSuccessAlert("Dihapus!", `Template '${template.templateName}' telah dihapus.`);
        fetchData();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Menghapus", err.message || "Gagal menghapus template.");
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ["Template ID,Kode,Nama Template,Modul,Min Nominal,Max Nominal,Urutan Approval"];
    const rows = templates.map((t) => {
      const steps = (t.details || [])
        .map((s) => `Step ${s.stepOrder}: ${s.approverType}`)
        .join(" -> ");
      return `"${t.templateId}","${t.templateCode}","${t.templateName}","${t.objectCode}","${t.minAmount ?? ""}","${t.maxAmount ?? ""}","${steps}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `approval_templates_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Template Approval" category="Administrasi Sistem" />

      <ApprovalTemplateFilter
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        objectCode={objectCode}
        onObjectCodeChange={(val) => {
          setObjectCode(val);
          setPage(1);
        }}
        onReset={() => {
          setSearch("");
          setObjectCode("");
          setPage(1);
        }}
        moduleOptions={lookups?.modules}
      />

      <ApprovalTemplateTable
        templates={templates}
        loading={loading}
        meta={meta}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onCreateOpen={handleOpenCreate}
        onEditOpen={handleOpenEdit}
        onDelete={handleDelete}
        onExport={handleExportCSV}
      />

      <ApprovalTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        template={selectedTemplate}
        lookups={lookups}
      />
    </div>
  );
}
