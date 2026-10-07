"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, UserPlus, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormGroup } from "@/components/forms/FormGroup";
import { FormInput } from "@/components/forms/FormInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeAlert } from "@/lib/sweetalert";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Nama lengkap wajib diisi.";
    if (!email.trim()) errs.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Format email tidak valid.";

    if (!password) errs.password = "Kata sandi wajib diisi.";
    else if (password.length < 6) errs.password = "Kata sandi minimal 6 karakter.";

    if (password !== confirmPassword) {
      errs.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    }

    if (!agreeTerms) {
      errs.agreeTerms = "Anda harus menyetujui syarat & ketentuan.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showErrorAlert("Pendaftaran Gagal", "Mohon lengkapi dan periksa kembali data formulir pendaftaran Anda.");
      return;
    }

    setIsLoading(true);
    showLoadingAlert("Mendaftarkan Akun...", "Menyiapkan akun administrator Galaxy Anda...");

    setTimeout(async () => {
      setIsLoading(false);
      setIsSuccess(true);
      closeAlert();
      await showSuccessAlert(
        "Pendaftaran Berhasil!",
        "Akun administrator Anda telah berhasil didaftarkan. Silakan login."
      );
      router.push("/login");
    }, 1200);
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-bold tracking-wide">Buat Akun Baru</CardTitle>
        <CardDescription>
          Daftarkan akun administrator untuk mengakses panel kontrol Galaxy
        </CardDescription>
      </CardHeader>

      {isSuccess && (
        <div className="mx-6 mt-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Registrasi berhasil! Mengarahkan ke halaman login...</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <FormGroup label="Nama Lengkap" required error={errors.name}>
            <FormInput
              placeholder="Contoh: Pratama Wijaya"
              value={name}
              hasError={!!errors.name}
              leftIcon={<User className="h-4 w-4" />}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
            />
          </FormGroup>

          <FormGroup label="Alamat Email" required error={errors.email}>
            <FormInput
              type="email"
              placeholder="nama@email.com"
              value={email}
              hasError={!!errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
            />
          </FormGroup>

          <FormGroup label="Kata Sandi" required error={errors.password}>
            <FormInput
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              hasError={!!errors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
            />
          </FormGroup>

          <FormGroup label="Konfirmasi Kata Sandi" required error={errors.confirmPassword}>
            <FormInput
              type="password"
              placeholder="Ulangi kata sandi"
              value={confirmPassword}
              hasError={!!errors.confirmPassword}
              leftIcon={<Lock className="h-4 w-4" />}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
              }}
            />
          </FormGroup>

          <div className="pt-1">
            <Checkbox
              checked={agreeTerms}
              onCheckedChange={(checked) => {
                setAgreeTerms(checked);
                if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: "" });
              }}
              hasError={!!errors.agreeTerms}
              label={
                <span>
                  Saya menyetujui{" "}
                  <a href="#terms" className="text-primary-600 dark:text-primary-400 underline font-medium">
                    Ketentuan Layanan
                  </a>{" "}
                  dan{" "}
                  <a href="#privacy" className="text-primary-600 dark:text-primary-400 underline font-medium">
                    Kebijakan Privasi
                  </a>
                </span>
              }
            />
            {errors.agreeTerms && (
              <p className="text-xs text-rose-500 font-medium mt-1">
                {errors.agreeTerms}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            <UserPlus className="h-4 w-4 mr-2 text-slate-950" />
            <span>Daftar Akun Baru</span>
          </Button>
        </CardContent>
      </form>

      <CardFooter className="justify-center border-t border-slate-100 dark:border-galaxy-border/50 bg-slate-50/50 dark:bg-galaxy-header/50 py-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
          >
            Masuk di Sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
