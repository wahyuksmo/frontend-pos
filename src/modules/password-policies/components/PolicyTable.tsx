"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Eye, KeyRound, ArrowUpDown, Download, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { PasswordPolicy, PaginationMeta } from "@/types";

export interface PolicyTableProps {
  policies: PasswordPolicy[];
  loading: boolean;
  meta?: PaginationMeta;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (policy: PasswordPolicy) => void;
  onViewDetail: (policy: PasswordPolicy) => void;
  onExport?: () => void;
}

export function PolicyTable({
  policies,
  loading,
  meta,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onViewDetail,
  onExport,
}: PolicyTableProps) {
  const total = meta?.total ?? policies.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Floating Dropdown state
  const [activeMenu, setActiveMenu] = useState<{
    policy: PasswordPolicy;
    top: number;
    left: number;
    openUp: boolean;
  } | null>(null);

  const handleToggleMenu = (policy: PasswordPolicy, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.policy.passwordPolicyId === policy.passwordPolicyId) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 100;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight;

    const top = openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const left = Math.max(10, rect.right - 176);

    setActiveMenu({
      policy,
      top,
      left,
      openUp,
    });
  };

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
      {/* Card Header */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/80 px-6 py-3.5 dark:border-galaxy-border/80">
        <div>
          <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
            Daftar Kebijakan Kata Sandi
          </CardTitle>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Aturan validasi keamanan akun terdaftar di sistem POS
          </p>
        </div>

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

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-galaxy-input text-slate-400 mb-3">
              <KeyRound className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Tidak ada data kebijakan kata sandi ditemukan
            </h4>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-y border-slate-200/80 bg-slate-50/70 dark:border-galaxy-border dark:bg-galaxy-thead text-slate-700 dark:text-slate-200">
                  <th className="py-3 px-6 font-semibold font-heading">
                    <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <span>Kode Kebijakan</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold font-heading">
                    <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <span>Nilai / Nilai Parameter</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold font-heading">
                    <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <span>Pesan Validasi / Deskripsi</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-center font-heading">
                    <span>Status Aturan</span>
                  </th>
                  <th className="py-3 px-6 font-semibold text-center font-heading">
                    <span>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/50 text-slate-700 dark:text-slate-300">
                {policies.map((policy) => {
                  const isCurrentActive = activeMenu?.policy.passwordPolicyId === policy.passwordPolicyId;
                  const isActive = policy.value !== "0" && policy.value !== "";

                  return (
                    <tr
                      key={policy.passwordPolicyId}
                      className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                    >
                      <td className="py-3.5 px-6 font-mono font-bold text-primary-400">
                        {policy.code}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-100">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border">
                          {policy.value}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {policy.message}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={isActive ? "success" : "danger"} className="px-2 py-0.5 text-[11px]">
                          {isActive ? "Aktif" : "Non-Aktif"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-6 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleMenu(policy, e)}
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

        {/* Table Footer */}
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

      {/* Floating Action Menu */}
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
              const p = activeMenu.policy;
              setActiveMenu(null);
              onViewDetail(p);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-galaxy-hover transition-colors rounded-lg text-left"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>Lihat Detail</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const p = activeMenu.policy;
              setActiveMenu(null);
              onEdit(p);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30 transition-colors rounded-lg text-left"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Kebijakan</span>
          </button>
        </div>
      )}
    </Card>
  );
}
