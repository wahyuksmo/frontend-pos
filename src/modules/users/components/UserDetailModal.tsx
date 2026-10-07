"use client";

import React from "react";
import { Mail, Phone, Shield, Calendar, Key, CheckCircle2, XCircle, Lock, Unlock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types";

export interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
  if (!user) return null;

  const isLocked = user.isLocked === "Y";
  const isActive = user.isActive === "Y";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Profil Pengguna"
      description="Informasi lengkap akun dan status otoritas pengguna."
      maxWidth="2xl"
      footer={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          Tutup
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Hero Card */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-galaxy-border/80 dark:bg-galaxy-thead/60">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-400/20 text-primary-400 font-bold text-base ring-4 ring-primary-400/20 font-heading">
            {user.fullname ? user.fullname.substring(0, 2).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-heading truncate">
              {user.fullname}
            </h4>
            <p className="text-xs text-primary-400 font-mono">@{user.username}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant={isActive ? "success" : "danger"} className="text-[10px]">
                {isActive ? "Status Aktif" : "Non-Aktif"}
              </Badge>
              <Badge variant={isLocked ? "danger" : "info"} className="text-[10px]">
                {isLocked ? "Akun Terkunci" : "Akses Normal"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Detailed Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Email */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Mail className="h-3.5 w-3.5 text-primary-400" />
              <span>Email Akun</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user.email || "-"}
            </p>
          </div>

          {/* Telepon */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Phone className="h-3.5 w-3.5 text-primary-400" />
              <span>Nomor Kontak</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user.phone || "-"}
            </p>
          </div>

          {/* Role */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Shield className="h-3.5 w-3.5 text-primary-400" />
              <span>User Group / Role</span>
            </div>
            <p className="font-semibold text-primary-400 truncate">
              {user.usergroup?.usergroupName || user.usergroup?.usergroupCode || "-"}
            </p>
          </div>

          {/* Tanggal Bergabung */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-galaxy-border/80 dark:bg-galaxy-input/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Calendar className="h-3.5 w-3.5 text-primary-400" />
              <span>Tanggal Terdaftar</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }) : "-"}
            </p>
          </div>
        </div>

        {/* Security / System ID Box */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-[11px] dark:border-galaxy-border/80 dark:bg-galaxy-thead/30 text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-3.5 w-3.5 text-primary-400 shrink-0" />
            <span className="font-mono truncate">ID: {user.userId}</span>
          </div>
          <span className="shrink-0 font-medium">
            {isLocked ? "Terkunci" : "Siap Digunakan"}
          </span>
        </div>
      </div>
    </Modal>
  );
}
