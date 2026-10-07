"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Shield,
  User,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ApprovalTransaction } from "@/types";

export interface ApprovalTimelineViewProps {
  transaction: ApprovalTransaction;
  canAct?: boolean;
  onApprove?: (notes?: string) => Promise<void>;
  onReject?: (notes: string) => Promise<void>;
  onRevise?: (notes: string) => Promise<void>;
  onResubmit?: (notes?: string) => Promise<void>;
}

export function ApprovalTimelineView({
  transaction,
  canAct = false,
  onApprove,
  onReject,
  onRevise,
  onResubmit,
}: ApprovalTimelineViewProps) {
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState<"approve" | "reject" | "revise" | "resubmit" | null>(
    null
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
          icon: CheckCircle2,
          text: "DISETUJUI PENUH",
        };
      case "REJECTED":
        return {
          bg: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800",
          icon: XCircle,
          text: "DITOLAK",
        };
      case "REVISED":
        return {
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          icon: RotateCcw,
          text: "PERLU REVISI",
        };
      default:
        return {
          bg: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800",
          icon: Clock,
          text: `MENUNGGU STEP ${transaction.currentStep}/${transaction.totalSteps}`,
        };
    }
  };

  const badge = getStatusBadge(transaction.status);
  const BadgeIcon = badge.icon;

  const handleExecuteAction = async () => {
    if (!showActionModal) return;
    setActionLoading(true);
    try {
      if (showActionModal === "approve" && onApprove) {
        await onApprove(notes);
      } else if (showActionModal === "reject" && onReject) {
        await onReject(notes);
      } else if (showActionModal === "revise" && onRevise) {
        await onRevise(notes);
      } else if (showActionModal === "resubmit" && onResubmit) {
        await onResubmit(notes);
      }
      setShowActionModal(null);
      setNotes("");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-galaxy-card border border-slate-200/80 dark:border-galaxy-border/80 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-galaxy-border/80 pb-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-heading">
            <Shield className="h-4 w-4 text-primary-400" />
            Alur Persetujuan ({transaction.template?.templateName || transaction.objectCode})
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Tahap {transaction.currentStep} dari {transaction.totalSteps} langkah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
          >
            <BadgeIcon className="h-3.5 w-3.5" />
            {badge.text}
          </span>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-galaxy-border/80">
        {transaction.details?.map((step) => {
          const isCompleted = step.action === "APPROVED";
          const isRejected = step.action === "REJECTED";
          const isRevised = step.action === "REVISED";
          const isCurrentActive =
            transaction.status === "PENDING" && step.stepOrder === transaction.currentStep;

          let bulletClass =
            "bg-slate-200 dark:bg-slate-800 text-slate-500 border-2 border-white dark:border-galaxy-card";
          if (isCompleted) {
            bulletClass = "bg-emerald-500 text-white border-2 border-white dark:border-galaxy-card";
          } else if (isRejected) {
            bulletClass = "bg-red-500 text-white border-2 border-white dark:border-galaxy-card";
          } else if (isRevised) {
            bulletClass = "bg-amber-500 text-white border-2 border-white dark:border-galaxy-card";
          } else if (isCurrentActive) {
            bulletClass =
              "bg-primary-500 text-white ring-4 ring-primary-500/20 border-2 border-white dark:border-galaxy-card animate-pulse";
          }

          return (
            <div key={step.approvalDetailId} className="relative">
              <div
                className={`absolute -left-6 top-0 flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${bulletClass}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isRejected ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : isRevised ? (
                  <RotateCcw className="h-3.5 w-3.5" />
                ) : (
                  step.stepOrder
                )}
              </div>

              <div className="bg-slate-50/80 dark:bg-galaxy-input/40 rounded-lg p-3.5 border border-slate-200/80 dark:border-galaxy-border/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                      Tahap {step.stepOrder}: {step.stepName}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200/80 dark:bg-galaxy-input text-slate-600 dark:text-slate-300 border border-slate-300/60 dark:border-galaxy-border">
                      {step.approverType === "DIRECT_MANAGER"
                        ? "Atasan Langsung"
                        : step.approverType === "ROLE"
                        ? "Role Approver"
                        : "User Khusus"}
                    </span>
                  </div>

                  {step.actionAt && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(step.actionAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs flex items-center gap-4 text-slate-600 dark:text-slate-400">
                  {step.actionByUser ? (
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <User className="h-3 w-3 text-primary-400" />
                      Oleh: {step.actionByUser.fullname} (@{step.actionByUser.username})
                    </span>
                  ) : isCurrentActive ? (
                    <span className="text-primary-500 dark:text-primary-400 font-medium">
                      Sedang menunggu tindakan approver
                    </span>
                  ) : (
                    <span className="text-slate-400">Menunggu giliran</span>
                  )}
                </div>

                {step.notes && (
                  <div className="mt-2 p-2 rounded bg-white dark:bg-galaxy-card border border-slate-200/80 dark:border-galaxy-border/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="italic">&ldquo;{step.notes}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {canAct && transaction.status === "PENDING" && (
        <div className="pt-4 border-t border-slate-200/80 dark:border-galaxy-border/80 flex flex-wrap items-center justify-end gap-2.5">
          <Button
            type="button"
            size="sm"
            onClick={() => setShowActionModal("revise")}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Minta Revisi
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowActionModal("reject")}
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Tolak
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowActionModal("approve")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-galaxy-cyan"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Setujui Langkah Ini
          </Button>
        </div>
      )}

      {canAct && transaction.status === "REVISED" && (
        <div className="pt-4 border-t border-slate-200/80 dark:border-galaxy-border/80 flex items-center justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() => setShowActionModal("resubmit")}
            className="bg-primary-600 hover:bg-primary-700 text-white text-xs shadow-galaxy-cyan"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Ajukan Ulang (Resubmit)
          </Button>
        </div>
      )}

      {showActionModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white dark:bg-galaxy-card rounded-xl p-5 border border-slate-200/80 dark:border-galaxy-border/80 shadow-2xl max-w-md w-full space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-heading">
              {showActionModal === "approve"
                ? "Konfirmasi Persetujuan"
                : showActionModal === "reject"
                ? "Konfirmasi Penolakan"
                : showActionModal === "revise"
                ? "Minta Revisi Transaksi"
                : "Ajukan Ulang Transaksi"}
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {showActionModal === "approve"
                ? "Apakah Anda yakin menyetujui tahap approval ini?"
                : showActionModal === "reject"
                ? "Masukkan alasan penolakan untuk transaksi ini:"
                : showActionModal === "revise"
                ? "Masukkan catatan bagian apa saja yang harus direvisi pemohon:"
                : "Transaksi akan dimulai kembali dari langkah approval pertama."}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 font-heading">
                Catatan / Alasan
              </label>
              <textarea
                rows={3}
                required={showActionModal === "reject" || showActionModal === "revise"}
                placeholder="Tulis catatan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-galaxy-border rounded-lg bg-slate-50 dark:bg-galaxy-input text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-400 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-galaxy-border/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowActionModal(null);
                  setNotes("");
                }}
                disabled={actionLoading}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleExecuteAction}
                disabled={actionLoading}
                className={`text-xs text-white ${
                  showActionModal === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-galaxy-cyan"
                    : showActionModal === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-primary-600 hover:bg-primary-700 shadow-galaxy-cyan"
                }`}
              >
                {actionLoading ? "Memproses..." : "Konfirmasi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
