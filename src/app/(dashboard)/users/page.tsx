"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { usersService, usergroupsService } from "@/services";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
  showLoadingAlert,
  closeAlert,
} from "@/lib/sweetalert";
import { UserFilter } from "@/modules/users/components/UserFilter";
import { UserTable } from "@/modules/users/components/UserTable";
import { UserCreateModal } from "@/modules/users/components/UserCreateModal";
import { UserEditModal } from "@/modules/users/components/UserEditModal";
import { UserDetailModal } from "@/modules/users/components/UserDetailModal";
import type { User, UserGroup, PaginationMeta } from "@/types";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [usergroups, setUsergroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Server-side filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedLock, setSelectedLock] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  // Load User Groups for dropdowns
  useEffect(() => {
    usergroupsService.findAll().then((res) => setUsergroups(res.data || [])).catch(() => {});
  }, []);

  // Fetch Users with Server-Side Querying
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.findAll({
        page,
        limit,
        search: search || undefined,
        usergroupId: selectedGroup || undefined,
        isActive: selectedStatus || undefined,
        isLocked: selectedLock || undefined,
      });
      setUsers(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedGroup, selectedStatus, selectedLock]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers
  const handleResetFilters = () => {
    setSearch("");
    setSelectedGroup("");
    setSelectedStatus("");
    setSelectedLock("");
    setPage(1);
  };

  const handleCreateUser = async (data: Partial<User> & { password?: string }) => {
    showLoadingAlert("Menyimpan...", "Mendaftarkan akun pengguna baru ke database...");
    try {
      const res = await usersService.create(data);
      closeAlert();
      await showSuccessAlert("Berhasil!", `Pengguna ${res.data.fullname} berhasil dibuat.`);
      fetchUsers();
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Menyimpan", err.message);
      throw err;
    }
  };

  const handleEditUser = async (id: string, data: Partial<User>) => {
    showLoadingAlert("Memperbarui...", "Menyimpan perubahan data akun...");
    try {
      await usersService.update(id, data);
      closeAlert();
      await showSuccessAlert("Berhasil!", "Data pengguna berhasil diperbarui.");
      fetchUsers();
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Memperbarui", err.message);
      throw err;
    }
  };

  const handleToggleLock = async (user: User) => {
    const isLocked = user.isLocked === "Y";
    const confirm = await showConfirmDialog({
      title: isLocked ? "Buka Kunci Akun?" : "Kunci Akun Pengguna?",
      text: isLocked
        ? `Akun ${user.fullname} akan dibuka kembali untuk login.`
        : `Akun ${user.fullname} akan dinonaktifkan sementara dari akses login.`,
      isDanger: !isLocked,
    });

    if (confirm.isConfirmed) {
      showLoadingAlert("Memproses...", "Mengubah status kunci akun...");
      try {
        await usersService.toggleLock(user.userId);
        closeAlert();
        await showSuccessAlert(
          "Status Diperbarui",
          `Akun ${user.fullname} sekarang ${isLocked ? "Normal (Aktif)" : "Terkunci"}.`
        );
        fetchUsers();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal", err.message);
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirm = await showConfirmDialog({
      title: "Hapus Pengguna?",
      text: `Hapus akun ${user.fullname} (${user.username})? Tindakan ini tidak dapat dibatalkan.`,
      isDanger: true,
    });

    if (confirm.isConfirmed) {
      showLoadingAlert("Menghapus...", "Sedang menghapus akun pengguna...");
      try {
        await usersService.delete(user.userId);
        closeAlert();
        await showSuccessAlert("Dihapus!", `Pengguna ${user.fullname} telah dihapus.`);
        fetchUsers();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Menghapus", err.message);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ["User ID,Username,Full Name,Email,Phone,User Group,Status,Locked,Created At"];
    const rows = users.map((u) =>
      `"${u.userId}","${u.username}","${u.fullname}","${u.email || ""}","${u.phone || ""}","${u.usergroup?.usergroupName || ""}","${u.isActive}","${u.isLocked}","${u.createdAt}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Akun Pengguna" category="Master Data" />

      {/* Filter Card Component */}
      <UserFilter
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        selectedGroup={selectedGroup}
        onGroupChange={(v) => { setSelectedGroup(v); setPage(1); }}
        selectedStatus={selectedStatus}
        onStatusChange={(v) => { setSelectedStatus(v); setPage(1); }}
        selectedLock={selectedLock}
        onLockChange={(v) => { setSelectedLock(v); setPage(1); }}
        onReset={handleResetFilters}
        usergroups={usergroups}
      />

      {/* Table Card Component */}
      <UserTable
        users={users}
        loading={loading}
        meta={meta}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onToggleLock={handleToggleLock}
        onViewDetail={(u) => { setActiveUser(u); setIsDetailOpen(true); }}
        onEdit={(u) => { setActiveUser(u); setIsEditOpen(true); }}
        onDelete={handleDeleteUser}
        onOpenCreate={() => setIsCreateOpen(true)}
        onExport={handleExportCSV}
      />

      {/* Modals */}
      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateUser}
        usergroups={usergroups}
      />

      <UserEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditUser}
        user={activeUser}
        usergroups={usergroups}
      />

      <UserDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        user={activeUser}
      />
    </div>
  );
}
