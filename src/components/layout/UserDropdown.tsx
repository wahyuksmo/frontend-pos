"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Key, LogOut, ChevronDown, AlertCircle } from "lucide-react";
import { authService } from "@/services";
import { Modal } from "@/components/ui/Modal";
import { FormGroup } from "@/components/forms/FormGroup";
import { FormInput } from "@/components/forms/FormInput";
import { Button } from "@/components/ui/Button";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeAlert } from "@/lib/sweetalert";

export function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    const cur = authService.getCurrentUser();
    if (cur) {
      setUser(cur);
    } else {
      setUser({
        fullname: "Administrator POS",
        username: "admin",
        email: "admin@pos.local",
        usergroup: { usergroupName: "Super Administrator" },
      });
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    authService.logout();
    router.push("/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");

    if (!oldPassword) {
      setPwdError("Kata sandi lama wajib diisi.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPwdError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    showLoadingAlert("Menyimpan...", "Mengenkripsi dan memperbarui kata sandi Anda...");
    setTimeout(async () => {
      closeAlert();
      await showSuccessAlert("Berhasil!", "Kata sandi akun Anda telah berhasil diubah.");
      setIsPasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 800);
  };

  return (
    <>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-galaxy-card focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-primary-500/30 dark:ring-primary-400/40">
            <Image
              src="/images/avatar-1.jpg"
              alt="User Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-heading">
              {user?.fullname || "Aditiya Pratama"}
            </p>
            <p className="text-[10px] text-primary-500 font-medium">
              {user?.usergroup?.usergroupName || "Super Administrator"}
            </p>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:block" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white/95 py-2 shadow-xl backdrop-blur-md dark:border-galaxy-border dark:bg-galaxy-card/95 animate-in fade-in-50 zoom-in-95 z-50">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-galaxy-border/50">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-heading">
                {user?.fullname || "Administrator POS"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || "admin@pos.local"}
              </p>
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-primary-400">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />
                {user?.usergroup?.usergroupCode || "SUPERADMIN"}
              </span>
            </div>

            <div className="py-1">
              <Link
                href="/users"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-galaxy-hover"
              >
                <User className="h-4 w-4 text-slate-400" />
                <span>Profil & Data Akun</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsPasswordModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-galaxy-hover text-left"
              >
                <Key className="h-4 w-4 text-slate-400" />
                <span>Ubah Kata Sandi</span>
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-galaxy-border/50 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ubah Kata Sandi */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Ubah Kata Sandi Akun"
        maxWidth="md"
        onSubmit={handleChangePassword}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Perbarui Kata Sandi
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kata sandi baru harus memenuhi aturan kebijakan keamanan: minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.
          </p>

          {pwdError && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-500 border border-rose-500/30">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{pwdError}</span>
            </div>
          )}

          <FormGroup label="Kata Sandi Lama" required>
            <FormInput
              type="password"
              placeholder="Masukkan kata sandi lama Anda"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Kata Sandi Baru" required>
            <FormInput
              type="password"
              placeholder="Minimal 8 karakter kombinasi"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Konfirmasi Kata Sandi Baru" required>
            <FormInput
              type="password"
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormGroup>
        </div>
      </Modal>
    </>
  );
}
