"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Link2, Download, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showSuccessAlert } from "@/lib/sweetalert";

const REFERRALS = [
  { domain: "www.google.com", percent: "24.58%", dotColor: "bg-primary-400" },
  { domain: "www.youtube.com", percent: "17.51%", dotColor: "bg-sky-400" },
  { domain: "www.meta.com", percent: "23.05%", dotColor: "bg-emerald-400" },
  { domain: "www.medium.com", percent: "12.22%", dotColor: "bg-amber-400" },
  { domain: "Other", percent: "17.58%", dotColor: "bg-rose-400" },
];

export function TopReferralsCard() {
  const handleExport = () => {
    showSuccessAlert("Laporan referrals berhasil diexport!");
  };

  return (
    <Card className="h-full flex flex-col border-slate-200/80 dark:border-galaxy-border shadow-galaxy">
      <CardHeader className="py-3 px-4 sm:px-5 flex flex-row items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border">
        <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary-500" />
          <span>Top Referrals Pages</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="text-xs h-7 px-2.5 border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10"
        >
          <Download className="h-3 w-3 mr-1" />
          Export Report
        </Button>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* Metric and Illustration Row */}
        <div className="flex items-center justify-between">
          <div>
            <h6 className="text-2xs font-bold text-slate-400 dark:text-galaxy-muted uppercase tracking-wider mb-1">
              Total Referrals Page
            </h6>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-heading">
              725,800
            </h3>
            <p className="text-xs text-slate-500 dark:text-galaxy-muted mt-1.5 flex items-center gap-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                15.72 %
              </span>
              <span>vs. previous month</span>
            </p>
          </div>
          <div className="relative w-20 h-16 shrink-0">
            <Image
              src="/images/illustrator-1.png"
              alt="Referrals Illustration"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="mt-5">
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-primary-400 h-full" style={{ width: "25%" }} title="Google 25%" />
            <div className="bg-sky-400 h-full" style={{ width: "18%" }} title="YouTube 18%" />
            <div className="bg-emerald-400 h-full" style={{ width: "22%" }} title="Meta 22%" />
            <div className="bg-amber-400 h-full" style={{ width: "16%" }} title="Medium 16%" />
            <div className="bg-rose-400 h-full" style={{ width: "19%" }} title="Other 19%" />
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="mt-4 divide-y divide-slate-100 dark:divide-galaxy-border/50 text-xs">
          {REFERRALS.map((item, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.dotColor}`} />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{item.domain}</span>
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-semibold">{item.percent}</span>
            </div>
          ))}
        </div>

        {/* Footer Show All */}
        <div className="mt-3 text-center">
          <Link
            href="#"
            className="text-xs font-semibold text-slate-500 dark:text-galaxy-muted hover:text-primary-500 dark:hover:text-primary-400 underline transition-colors"
          >
            Show All
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
