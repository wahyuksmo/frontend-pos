"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { UserGroupFilter, UserGroupTable, UserGroupModal } from "@/modules/usergroups";
import { usergroupsService } from "@/services";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
  showLoadingAlert,
  closeAlert,
} from "@/lib/sweetalert";
import type { UserGroup, PaginationMeta } from "@/types";

export default function UserGroupsPage() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  // Server-side query state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usergroupsService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
      });
      setGroups(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Gagal memuat daftar role.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setSelectedGroup(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: UserGroup) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (formData: { usergroupCode: string; usergroupName: string }) => {
    if (!formData.usergroupName.trim()) {
      showErrorAlert("Validasi Gagal", "Nama Role wajib diisi.");
      return;
    }

    if (selectedGroup) {
      // Edit
      showLoadingAlert("Memperbarui...", "Menyimpan perubahan role...");
      try {
        await usergroupsService.update(selectedGroup.usergroupId, {
          usergroupName: formData.usergroupName,
        });
        closeAlert();
        await showSuccessAlert("Berhasil!", "Nama role berhasil diperbarui.");
        fetchData();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Memperbarui", err.message || "Gagal memperbarui user group.");
        throw err;
      }
    } else {
      // Create
      if (!formData.usergroupCode.trim()) {
        showErrorAlert("Validasi Gagal", "Kode Role wajib diisi.");
        return;
      }
      showLoadingAlert("Menyimpan...", "Menambahkan role baru ke sistem...");
      try {
        await usergroupsService.create(formData);
        closeAlert();
        await showSuccessAlert("Berhasil!", "User group / role baru berhasil ditambahkan.");
        fetchData();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Menyimpan", err.message || "Gagal membuat user group.");
        throw err;
      }
    }
  };

  const handleDelete = async (group: UserGroup) => {
    const confirm = await showConfirmDialog({
      title: "Hapus User Group?",
      text: `Apakah Anda yakin ingin menghapus role '${group.usergroupName}'? Pengguna dengan role ini akan kehilangan asosiasi hak akses.`,
      isDanger: true,
    });

    if (confirm.isConfirmed) {
      showLoadingAlert("Menghapus...", "Sedang menghapus role...");
      try {
        await usergroupsService.delete(group.usergroupId);
        closeAlert();
        await showSuccessAlert("Dihapus!", `Role '${group.usergroupName}' telah dihapus.`);
        fetchData();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Menghapus", err.message || "Gagal menghapus user group.");
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ["User Group ID,Kode Role,Nama Role,Jumlah Pengguna,Dibuat Pada"];
    const rows = groups.map((g) =>
      `"${g.usergroupId}","${g.usergroupCode}","${g.usergroupName}","${g._count?.users ?? 0}","${g.createdAt || ""}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `roles_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageTitleBox title="User Groups & Hak Akses" category="Master Data" />

      {/* Card 1: Filter Parameter */}
      <UserGroupFilter
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
      />

      {/* Card 2: Server-Side Table */}
      <UserGroupTable
        groups={groups}
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

      {/* Reusable Create/Edit Modal */}
      <UserGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        group={selectedGroup}
      />
    </div>
  );
}
