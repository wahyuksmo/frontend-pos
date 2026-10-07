"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import {
  PolicyFilter,
  PolicyTable,
  PolicyEditModal,
  PolicyDetailModal,
  PolicySimulator,
} from "@/modules/password-policies";
import { passwordPoliciesService } from "@/services";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeAlert,
} from "@/lib/sweetalert";
import type { PasswordPolicy } from "@/types";

export default function PasswordPoliciesPage() {
  const [policies, setPolicies] = useState<PasswordPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  // Server-side / client-side filter and pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<PasswordPolicy | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await passwordPoliciesService.findAll({
        search: search.trim() || undefined,
      });
      setPolicies(res.data || []);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Kebijakan", err.message || "Gagal memuat aturan kebijakan kata sandi.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Filtered policies (supports status filter)
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      if (statusFilter === "ACTIVE") {
        return p.value !== "0" && p.value !== "";
      }
      if (statusFilter === "INACTIVE") {
        return p.value === "0" || p.value === "";
      }
      return true;
    });
  }, [policies, statusFilter]);

  // Paginated policies
  const paginatedPolicies = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPolicies.slice(start, start + pageSize);
  }, [filteredPolicies, page, pageSize]);

  const paginationMeta = useMemo(() => {
    const total = filteredPolicies.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return {
      total,
      totalPages,
      page,
      limit: pageSize,
    };
  }, [filteredPolicies.length, page, pageSize]);

  const handleOpenEdit = (p: PasswordPolicy) => {
    setCurrentPolicy(p);
    setIsEditOpen(true);
  };

  const handleOpenDetail = (p: PasswordPolicy) => {
    setCurrentPolicy(p);
    setIsDetailOpen(true);
  };

  const handleEditSubmit = async (data: { value: string; message: string }) => {
    if (!currentPolicy) return;

    showLoadingAlert("Menyimpan...", "Memperbarui konfigurasi kebijakan sandi...");
    try {
      await passwordPoliciesService.update(currentPolicy.passwordPolicyId, data);
      closeAlert();
      await showSuccessAlert("Berhasil!", `Kebijakan ${currentPolicy.code} berhasil diperbarui.`);
      fetchPolicies();
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Menyimpan", err.message || "Gagal memperbarui kebijakan.");
      throw err;
    }
  };

  const handleExportCSV = () => {
    const headers = ["Policy ID,Kode Kebijakan,Nilai Parameter,Pesan Validasi,Status,Terakhir Diubah"];
    const rows = filteredPolicies.map((p) => {
      const isActive = p.value !== "0" && p.value !== "" ? "Aktif" : "Non-Aktif";
      return `"${p.passwordPolicyId}","${p.code}","${p.value}","${p.message}","${isActive}","${p.updatedAt || ""}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `password_policies_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <PageTitleBox
        title="Kebijakan Keamanan Kata Sandi"
        category="Sistem & Keamanan"
      />

      {/* Card 1: Filter Parameter */}
      <PolicyFilter
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        status={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        onReset={() => {
          setSearch("");
          setStatusFilter("");
          setPage(1);
        }}
      />

      {/* Card 2: Datatables Standard */}
      <PolicyTable
        policies={paginatedPolicies}
        loading={loading}
        meta={paginationMeta}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onEdit={handleOpenEdit}
        onViewDetail={handleOpenDetail}
        onExport={handleExportCSV}
      />

      {/* Live Interactive Simulator Section */}
      <div className="pt-2">
        <PolicySimulator policies={policies} />
      </div>

      {/* Modals */}
      <PolicyEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        policy={currentPolicy}
        onSubmit={handleEditSubmit}
      />

      <PolicyDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        policy={currentPolicy}
      />
    </div>
  );
}
