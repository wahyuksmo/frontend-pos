"use client";

import React from "react";
import { Edit2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { PasswordPolicy } from "@/types";

interface PolicyListProps {
  policies: PasswordPolicy[];
  loading: boolean;
  onEdit: (policy: PasswordPolicy) => void;
}

export function PolicyList({ policies, loading, onEdit }: PolicyListProps) {
  return (
    <Card>
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold tracking-wide uppercase text-slate-800 dark:text-slate-100 font-heading">
              Konfigurasi Standar Kebijakan Kata Sandi
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Aturan ini secara otomatis divalidasi oleh backend saat pendaftaran akun atau ganti kata sandi.
            </p>
          </div>
          <span className="rounded bg-primary-400/10 px-2 py-0.5 text-[11px] font-bold text-primary-400 border border-primary-400/20">
            {policies.length} Aturan Aktif
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-galaxy-border/50">
            {policies.map((policy) => (
              <div
                key={policy.passwordPolicyId}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary-400 bg-primary-400/10 px-2 py-0.5 rounded border border-primary-400/20">
                      {policy.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                      Nilai: <strong className="text-primary-400 font-mono">{policy.value}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    {policy.message}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(policy)}
                  className="gap-1.5 self-start sm:self-center text-xs"
                >
                  <Edit2 className="h-3 w-3 text-sky-400" />
                  <span>Edit Kebijakan</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
