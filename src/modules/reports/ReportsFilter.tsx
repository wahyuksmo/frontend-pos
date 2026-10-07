"use client";

import React from "react";
import { Search, RotateCcw, Filter, Calendar, Store, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { DateRangePickerInput } from "@/components/forms/DateRangePickerInput";
import type { SelectOption } from "@/types";

export interface ReportsFilterProps {
  startDate: string;
  endDate: string;
  outletId: string;
  paymentStatus?: string;
  datePreset: string;
  outlets: Array<{ outletId: string; outletName: string }>;
  showPaymentStatus?: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onOutletChange: (outletId: string) => void;
  onPaymentStatusChange?: (status: string) => void;
  onPresetSelect: (preset: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export function ReportsFilter({
  startDate,
  endDate,
  outletId,
  paymentStatus = "ALL",
  datePreset,
  outlets,
  showPaymentStatus = true,
  onStartDateChange,
  onEndDateChange,
  onOutletChange,
  onPaymentStatusChange,
  onPresetSelect,
  onFilter,
  onReset,
}: ReportsFilterProps) {
  const presetButtons = [
    { id: "today", label: "Hari Ini" },
    { id: "yesterday", label: "Kemarin" },
    { id: "7d", label: "7 Hari Terakhir" },
    { id: "30d", label: "30 Hari Terakhir" },
    { id: "month", label: "Bulan Ini" },
    { id: "all", label: "Semua Data" },
  ];

  const outletOptions: SelectOption[] = [
    { value: "", label: "Semua Outlet Cabang" },
    ...outlets.map((o) => ({
      value: o.outletId,
      label: o.outletName,
    })),
  ];

  const paymentOptions: SelectOption[] = [
    { value: "ALL", label: "Semua Status Pembayaran" },
    { value: "PAID", label: "Lunas (PAID)" },
    { value: "UNPAID", label: "Belum Lunas (UNPAID)" },
    { value: "REFUNDED", label: "Pengembalian (REFUNDED)" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter();
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm print:hidden">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-primary-400" />
          <span>Filter Parameter Analisis & Laporan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Periode Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-galaxy-border/80 text-xs">
          <span className="text-slate-500 dark:text-galaxy-muted font-medium mr-1.5 flex items-center gap-1.5 font-heading">
            <Calendar className="h-3.5 w-3.5 text-primary-400" />
            <span>Periode Cepat:</span>
          </span>
          {presetButtons.map((p) => {
            const isActive = datePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPresetSelect(p.id)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary-600 text-white dark:bg-primary-400 dark:text-slate-950 font-semibold shadow-galaxy-cyan"
                    : "bg-slate-100 dark:bg-galaxy-input text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-galaxy-hover border border-slate-200/60 dark:border-galaxy-border/60"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Detailed Form Filters */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${showPaymentStatus ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
            {/* Rentang Tanggal Kalender Popup Dropdown */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Calendar className="h-3.5 w-3.5 text-primary-400" />
                <span>Rentang Tanggal (Kalender Popup)</span>
              </label>
              <DateRangePickerInput
                startDate={startDate}
                endDate={endDate}
                activePreset={datePreset}
                onChange={(s, e, preset) => {
                  onStartDateChange(s);
                  onEndDateChange(e);
                  if (preset) onPresetSelect(preset);
                }}
                placeholder="Pilih rentang tanggal..."
                size="sm"
              />
            </div>

            {/* Filter Outlet via SearchableSelect */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Store className="h-3.5 w-3.5 text-primary-400" />
                <span>Outlet Cabang</span>
              </label>
              <SearchableSelect
                size="sm"
                options={outletOptions}
                value={outletId}
                onChange={onOutletChange}
                placeholder="Pilih Outlet..."
                clearable={Boolean(outletId)}
              />
            </div>

            {/* Filter Status Pembayaran via SearchableSelect */}
            {showPaymentStatus && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                  <CreditCard className="h-3.5 w-3.5 text-primary-400" />
                  <span>Status Pembayaran</span>
                </label>
                <SearchableSelect
                  size="sm"
                  options={paymentOptions}
                  value={paymentStatus}
                  onChange={(val) => onPaymentStatusChange && onPaymentStatusChange(val || "ALL")}
                  placeholder="Pilih Status..."
                  clearable={false}
                />
              </div>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" variant="primary" size="sm" className="gap-1.5 shadow-galaxy-cyan">
              <Search className="h-3.5 w-3.5" />
              <span>Terapkan Filter</span>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
