"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, UserCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormGroup } from "@/components/forms/FormGroup";
import { FormInput } from "@/components/forms/FormInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { authService } from "@/services";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeAlert } from "@/lib/sweetalert";

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("admin");
  const [password, setPassword] = useState("Password123!");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickFill = (user: string, pass: string) => {
    setUsernameOrEmail(user);
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!usernameOrEmail.trim()) {
      errs.usernameOrEmail = "Username atau email wajib diisi.";
    }
    if (!password.trim()) {
      errs.password = "Kata sandi wajib diisi.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showErrorAlert("Validasi Gagal", "Mohon isi nama pengguna dan kata sandi Anda.");
      return;
    }

    setIsLoading(true);
    showLoadingAlert("Mengautentikasi...", "Memverifikasi akun dan hak akses Anda...");

    try {
      const res = await authService.login({
        username: usernameOrEmail.trim(),
        password,
      });
      setIsLoading(false);
      closeAlert();
      await showSuccessAlert(
        "Login Berhasil!",
        `Selamat datang kembali, ${res.data?.user?.fullname || "Administrator"}!`
      );
      router.push("/");
    } catch (err: any) {
      setIsLoading(false);
      closeAlert();
      showErrorAlert("Login Gagal", err.message || "Username atau kata sandi tidak valid.");
    }
  };

  return (
    <Card className="shadow-2xl border-slate-200 dark:border-galaxy-border">
      <CardHeader className="text-center pb-2">
      
        <CardTitle className="font-bold tracking-wide font-heading">
          Login
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-3">
          <FormGroup label="Username atau Email" required error={errors.usernameOrEmail}>
            <FormInput
              placeholder="Masukkan username atau email"
              value={usernameOrEmail}
              onChange={(e) => {
                setUsernameOrEmail(e.target.value);
                if (errors.usernameOrEmail) setErrors({ ...errors, usernameOrEmail: "" });
              }}
              leftIcon={<Mail className="h-4 w-4" />}
              hasError={!!errors.usernameOrEmail}
            />
          </FormGroup>

          <FormGroup label="Kata Sandi" required error={errors.password}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">Kebijakan sandi backend aktif</span>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Silakan hubungi Superadmin untuk mereset kata sandi Anda.");
                }}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Lupa sandi?
              </a>
            </div>
            <FormInput
              type="password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              hasError={!!errors.password}
            />
          </FormGroup>

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              id="rememberMe"
              label="Ingat Saya di perangkat ini"
              checked={rememberMe}
              onCheckedChange={(val) => setRememberMe(val)}
            />
          </div>

          {/* Quick Demo Fill Pills */}
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-galaxy-input border border-slate-200 dark:border-galaxy-border/70 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-galaxy-menuTitle flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary-600 dark:text-primary-400" />
              Uji Coba Akun Cepat (Akun Database POS):
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill("admin", "Password123!")}
                className="rounded bg-primary-500/10 px-2 py-0.5 font-mono text-primary-700 dark:bg-primary-400/15 dark:text-primary-400 hover:bg-primary-500/20 dark:hover:bg-primary-400/25 border border-primary-500/20 dark:border-primary-400/30 transition-colors"
                title="Super Administrator (Full Access)"
              >
                admin (Superadmin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("spv1", "Password123!")}
                className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-400/25 border border-emerald-500/20 dark:border-emerald-400/30 transition-colors"
                title="Supervisor Toko"
              >
                spv1 (Supervisor)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("cashier1", "Password123!")}
                className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-400 hover:bg-cyan-500/20 dark:hover:bg-cyan-400/25 border border-cyan-500/20 dark:border-cyan-400/30 transition-colors"
                title="Kasir POS"
              >
                cashier1 (Kasir)
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full shadow-galaxy-cyan mb-7"
            isLoading={isLoading}
          >
            <span>Masuk ke POS Enterprise</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

        </CardFooter>
      </form>
    </Card>
  );
}
