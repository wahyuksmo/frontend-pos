"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Phone,
  Shield,
  Lock,
  Unlock,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  Plus,
  Download,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { User, PaginationMeta } from "@/types";

export interface UserTableProps {
  users: User[];
  loading: boolean;
  meta?: PaginationMeta;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onToggleLock: (user: User) => void;
  onViewDetail: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onOpenCreate?: () => void;
  onExport?: () => void;
}

export function UserTable({
  users,
  loading,
  meta,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onToggleLock,
  onViewDetail,
  onEdit,
  onDelete,
  onOpenCreate,
  onExport,
}: UserTableProps) {
  const total = meta?.total ?? users.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Floating Dropdown state with fixed viewport coordinates to prevent overflow clipping
  const [activeMenu, setActiveMenu] = useState<{
    user: User;
    top: number;
    left: number;
    openUp: boolean;
  } | null>(null);

  const handleToggleMenu = (user: User, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.user.userId === user.userId) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 175; // Approx menu height
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight;

    const top = openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const left = Math.max(10, rect.right - 176); // Align right edge to button (176px width)

    setActiveMenu({
      user,
      top,
      left,
      openUp,
    });
  };

  // Close floating dropdown on outside click, window resize or scroll
  useEffect(() => {
    if (!activeMenu) return;

    const handleClose = () => setActiveMenu(null);
    window.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);

    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [activeMenu]);

  // Generate pagination numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm relative">
      {/* Card Header: Title on Left, Tambah & Export on Right */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/80 px-6 py-3.5 dark:border-galaxy-border/80">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Daftar Pengguna
        </CardTitle>

        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </Button>
          )}

          {onOpenCreate && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onOpenCreate}
              className="gap-1.5 shadow-galaxy-cyan"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Pengguna</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Top Control: Show entries */}
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-primary-400 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-galaxy-input text-slate-400 mb-3">
              <Users className="h-7 w-7" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Tidak ada data pengguna ditemukan
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Silakan periksa filter atau tambahkan data pengguna baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-y border-slate-200/80 bg-slate-50/70 dark:border-galaxy-border dark:bg-galaxy-thead text-slate-700 dark:text-slate-200">
                  <th className="py-3 px-6 font-semibold font-heading">
                    <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <span>Nama Pengguna</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold font-heading">
                    <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <span>Username</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold font-heading">
                    <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <span>Kontak</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold font-heading">
                    <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <span>Role / User Group</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-center font-heading">
                    <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <span>Status</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-center font-heading">
                    <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <span>Kunci Akun</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-6 font-semibold text-center font-heading">
                    <span>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/50 text-slate-700 dark:text-slate-300">
                {users.map((user) => {
                  const isLocked = user.isLocked === "Y";
                  const isActive = user.isActive === "Y";
                  const isCurrentActive = activeMenu?.user.userId === user.userId;

                  return (
                    <tr
                      key={user.userId}
                      className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                    >
                      {/* Nama Pengguna */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-400/15 text-primary-400 font-bold text-xs border border-primary-400/25">
                            {user.fullname ? user.fullname.substring(0, 2).toUpperCase() : "U"}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {user.fullname}
                          </span>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        @{user.username}
                      </td>

                      {/* Kontak */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{user.email || "-"}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 rounded bg-primary-400/10 px-2 py-0.5 text-xs font-semibold text-primary-400 border border-primary-400/25">
                          <Shield className="h-3 w-3" />
                          {user.usergroup?.usergroupName || user.usergroup?.usergroupCode || "No Role"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={isActive ? "success" : "danger"} className="px-2 py-0.5 text-[11px]">
                          {isActive ? "Aktif" : "Non-Aktif"}
                        </Badge>
                      </td>

                      {/* Kunci Akun */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleLock(user)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                            isLocked
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                          }`}
                          title="Klik untuk mengubah status kunci akun"
                        >
                          {isLocked ? (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Terkunci</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3 w-3" />
                              <span>Normal</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Aksi Button (Velzon Galaxy Dropdown Trigger) */}
                      <td className="py-3.5 px-6 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleMenu(user, e)}
                          className={`inline-flex h-7 w-8 items-center justify-center rounded border transition-all text-xs font-bold select-none ${
                            isCurrentActive
                              ? "border-primary-400 bg-primary-400/15 text-primary-400 shadow-sm"
                              : "border-slate-200 bg-slate-100/70 hover:bg-slate-200/80 text-slate-700 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-300 dark:hover:bg-galaxy-hover"
                          }`}
                          title="Menu Aksi"
                        >
                          ...
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer: Showing text on Left, Pagination on Right */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-slate-200/80 dark:border-galaxy-border/80 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing {startItem} to {endItem} of {total} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 font-medium transition-colors"
            >
              Previous
            </button>

            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-slate-400 select-none">
                    ...
                  </span>
                );
              }

              const pageNum = Number(p);
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`flex h-8 min-w-[32px] items-center justify-center px-2 rounded text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary-400 text-slate-950 font-bold shadow-sm shadow-primary-400/30"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 dark:hover:bg-galaxy-hover"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>

      {/* Velzon Galaxy Floating Action Menu (Never clipped by overflow or table boundaries) */}
      {activeMenu && (
        <div
          style={{
            position: "fixed",
            top: `${activeMenu.top}px`,
            left: `${activeMenu.left}px`,
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-44 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-2xl backdrop-blur-md dark:border-galaxy-border dark:bg-galaxy-card/95 animate-in fade-in-50 zoom-in-95"
        >
          <button
            type="button"
            onClick={() => {
              const u = activeMenu.user;
              setActiveMenu(null);
              onViewDetail(u);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-galaxy-hover transition-colors rounded-lg text-left"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>Lihat Detail</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const u = activeMenu.user;
              setActiveMenu(null);
              onEdit(u);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30 transition-colors rounded-lg text-left"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Pengguna</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const u = activeMenu.user;
              setActiveMenu(null);
              onToggleLock(u);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 transition-colors rounded-lg text-left"
          >
            {activeMenu.user.isLocked === "Y" ? (
              <>
                <Unlock className="h-3.5 w-3.5" />
                <span>Buka Kunci</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>Kunci Akun</span>
              </>
            )}
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-galaxy-border/50" />

          <button
            type="button"
            onClick={() => {
              const u = activeMenu.user;
              setActiveMenu(null);
              onDelete(u);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors rounded-lg text-left"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Pengguna</span>
          </button>
        </div>
      )}
    </Card>
  );
}
