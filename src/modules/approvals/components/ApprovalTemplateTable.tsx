"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Layers, ChevronRight, Eye, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ApprovalTemplate, PaginationMeta } from "@/types";

export interface ApprovalTemplateTableProps {
  templates: ApprovalTemplate[];
  loading: boolean;
  meta?: PaginationMeta;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onCreateOpen: () => void;
  onEditOpen: (template: ApprovalTemplate) => void;
  onDelete: (template: ApprovalTemplate) => void;
  onExport?: () => void;
}

export function ApprovalTemplateTable({
  templates,
  loading,
  meta,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onCreateOpen,
  onEditOpen,
  onDelete,
  onExport,
}: ApprovalTemplateTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const total = meta?.total ?? templates.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Floating Dropdown state with fixed viewport coordinates to prevent clipping
  const [activeMenu, setActiveMenu] = useState<{
    template: ApprovalTemplate;
    top: number;
    left: number;
  } | null>(null);

  const handleToggleMenu = (template: ApprovalTemplate, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.template.templateId === template.templateId) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 135;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight;

    const top = openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const left = Math.max(10, rect.right - 176);

    setActiveMenu({
      template,
      top,
      left,
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

  const formatCurrency = (val?: number | null) => {
    if (val == null) return null;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
      Number(val)
    );
  };

  const renderNominalCondition = (t: ApprovalTemplate) => {
    if (t.minAmount == null && t.maxAmount == null) {
      return <span className="text-slate-400 italic">Semua Nominal</span>;
    }
    const min = formatCurrency(t.minAmount);
    const max = formatCurrency(t.maxAmount);

    if (t.minAmount != null && t.maxAmount != null) {
      return (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {min} - {max}
        </span>
      );
    }
    if (t.minAmount != null) {
      return (
        <span className="font-semibold text-cyan-600 dark:text-cyan-400">
          ≥ {min}
        </span>
      );
    }
    return (
      <span className="font-semibold text-amber-600 dark:text-amber-400">
        ≤ {max}
      </span>
    );
  };

  const getApproverTypeBadge = (type: string) => {
    switch (type) {
      case "DIRECT_MANAGER":
        return "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30";
      case "ROLE":
        return "bg-purple-500/15 text-purple-400 border border-purple-500/30";
      case "SPECIFIC_USER":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
      default:
        return "bg-slate-500/15 text-slate-400 border border-slate-500/30";
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm relative">
      {/* Card Header: Title on Left, Tambah Button on Right */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/80 px-6 py-3.5 dark:border-galaxy-border/80">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
          Daftar Template Workflow Approval
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

          {onCreateOpen && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onCreateOpen}
              className="gap-1.5 shadow-galaxy-cyan"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Template</span>
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
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-galaxy-input text-slate-400 mb-3">
              <Layers className="h-7 w-7 text-primary-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Belum ada template approval
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Silakan periksa kata kunci pencarian atau buat template workflow approval baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-y border-slate-200/80 bg-slate-50/70 dark:border-galaxy-border dark:bg-galaxy-thead text-slate-700 dark:text-slate-200">
                  <th className="py-3 px-6 font-semibold font-heading w-12 text-center">#</th>
                  <th className="py-3 px-4 font-semibold font-heading">Kode Template</th>
                  <th className="py-3 px-4 font-semibold font-heading">Nama Template</th>
                  <th className="py-3 px-4 font-semibold font-heading">Modul Objek</th>
                  <th className="py-3 px-4 font-semibold font-heading">Kondisi Nominal</th>
                  <th className="py-3 px-4 font-semibold text-center font-heading">Tahapan Persetujuan</th>
                  <th className="py-3 px-6 font-semibold text-center font-heading">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/50 text-slate-700 dark:text-slate-300">
                {templates.map((tpl, index) => {
                  const isExpanded = expandedId === tpl.templateId;
                  const itemIndex = (currentPage - 1) * pageSize + index + 1;
                  const isCurrentActive = activeMenu?.template.templateId === tpl.templateId;

                  return (
                    <React.Fragment key={tpl.templateId}>
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors">
                        <td className="py-3.5 px-6 text-center font-mono text-slate-400">
                          {itemIndex}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-primary-400">
                          {tpl.templateCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {tpl.templateName}
                          </div>
                          {tpl.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {tpl.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-galaxy-input text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-galaxy-border">
                            {tpl.objectCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {renderNominalCondition(tpl)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : tpl.templateId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary-400/10 text-primary-400 hover:bg-primary-400/20 border border-primary-400/20 transition-colors cursor-pointer select-none"
                            title="Klik untuk melihat urutan alur step"
                          >
                            <span>{tpl.details?.length || 0} Step</span>
                            <ChevronRight
                              className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                        </td>
                        {/* Action Button (Velzon Galaxy Dropdown Trigger) */}
                        <td className="py-3.5 px-6 text-center">
                          <button
                            type="button"
                            onClick={(e) => handleToggleMenu(tpl, e)}
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

                      {/* Expandable Step Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-galaxy-card/40">
                          <td colSpan={7} className="py-3.5 px-6">
                            <div className="pl-4 border-l-2 border-primary-400 py-1 space-y-2">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-heading">
                                Urutan Langkah Persetujuan: {tpl.templateName}
                              </p>
                              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                {tpl.details && tpl.details.length > 0 ? (
                                  tpl.details.map((step, sIdx) => (
                                    <div
                                      key={step.templateDetailId || sIdx}
                                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs dark:border-galaxy-border dark:bg-galaxy-input"
                                    >
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-400 text-slate-950 font-bold text-[10px]">
                                        {step.stepOrder}
                                      </span>
                                      <div>
                                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                                          {step.stepName}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span
                                            className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${getApproverTypeBadge(
                                              step.approverType
                                            )}`}
                                          >
                                            {step.approverType === "DIRECT_MANAGER"
                                              ? "Atasan Langsung"
                                              : step.approverType === "ROLE"
                                              ? `Role: ${step.usergroup?.usergroupName || step.usergroup?.usergroupCode || "Role Dipilih"}`
                                              : `User: ${step.user?.fullname || "User Spesifik"}`}
                                          </span>
                                          {step.canRevise === "Y" && (
                                            <span className="text-[10px] text-amber-500 font-medium">
                                              • Bisa Revisi
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {sIdx < tpl.details.length - 1 && (
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 ml-1" />
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    Belum ada tahapan alur yang diatur.
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

      {/* Velzon Galaxy Floating Action Menu */}
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
              const tpl = activeMenu.template;
              setActiveMenu(null);
              setExpandedId(expandedId === tpl.templateId ? null : tpl.templateId);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-galaxy-hover transition-colors rounded-lg text-left"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>Lihat Tahapan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const tpl = activeMenu.template;
              setActiveMenu(null);
              onEditOpen(tpl);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30 transition-colors rounded-lg text-left"
          >
            <Edit2 className="h-3.5 w-3.5 text-sky-500" />
            <span>Edit Template</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const tpl = activeMenu.template;
              setActiveMenu(null);
              onDelete(tpl);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors rounded-lg text-left"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            <span>Hapus Template</span>
          </button>
        </div>
      )}
    </Card>
  );
}

