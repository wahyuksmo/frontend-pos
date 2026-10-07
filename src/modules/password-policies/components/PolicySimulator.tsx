"use client";

import React, { useState } from "react";
import { Sparkles, Eye, EyeOff, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { PasswordPolicy } from "@/types";

interface PolicySimulatorProps {
  policies: PasswordPolicy[];
}

export function PolicySimulator({ policies }: PolicySimulatorProps) {
  const [testPassword, setTestPassword] = useState("Admin#2026");
  const [showPassword, setShowPassword] = useState(false);

  // Evaluate simulator password against active policies
  const evaluateRule = (code: string, value: string) => {
    const val = Number(value) || 0;
    switch (code) {
      case "MIN_LENGTH":
        return testPassword.length >= val;
      case "REQUIRE_UPPERCASE":
        return val === 0 || /[A-Z]/.test(testPassword);
      case "REQUIRE_LOWERCASE":
        return val === 0 || /[a-z]/.test(testPassword);
      case "REQUIRE_NUMBER":
        return val === 0 || /[0-9]/.test(testPassword);
      case "REQUIRE_SPECIAL_CHAR":
        return val === 0 || /[^A-Za-z0-9]/.test(testPassword);
      default:
        return true;
    }
  };

  const allRulesPassed = policies.length > 0 && policies.every((p) => evaluateRule(p.code, p.value));

  return (
    <Card className="border-primary-400/40 shadow-galaxy-cyan">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-400" />
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-slate-800 dark:text-slate-100 font-heading">
            Simulator Uji Sandi
          </CardTitle>
        </div>
        <p className="text-xs text-slate-400">
          Ketikkan kata sandi di bawah untuk memverifikasi apakah memenuhi seluruh aturan keamanan backend.
        </p>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="Ketik kata sandi uji..."
            className="h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 pr-10 text-xs font-mono text-slate-900 focus:border-primary-400 focus:bg-white focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`flex items-center gap-2.5 rounded-lg p-3 text-xs border ${
            allRulesPassed
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}
        >
          {allRulesPassed ? (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="font-semibold">Sandi Memenuhi Seluruh Standar Keamanan!</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Kata sandi belum memenuhi seluruh kebijakan di bawah.</span>
            </>
          )}
        </div>

        {/* Criteria checklist */}
        <div className="space-y-2 pt-1 text-xs">
          {policies.map((p) => {
            const passed = evaluateRule(p.code, p.value);
            return (
              <div
                key={p.passwordPolicyId}
                className={`flex items-start gap-2 rounded-md p-2 transition-colors ${
                  passed
                    ? "bg-emerald-500/5 text-emerald-300"
                    : "bg-slate-100/60 dark:bg-galaxy-input text-slate-400"
                }`}
              >
                {passed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div>
                  <p
                    className={`text-[11px] leading-tight ${
                      passed ? "text-emerald-400 font-semibold" : "text-slate-400"
                    }`}
                  >
                    {p.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
