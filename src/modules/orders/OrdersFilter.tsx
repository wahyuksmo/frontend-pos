"use client";

import React, { useState } from "react";
import { Search, RotateCcw, Filter, Store, CreditCard, ShoppingBag, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { SelectOption } from "@/types";

export interface OrdersFilterProps {
  search: string;
  outletId?: string;
  paymentStatus?: string;
  orderType?: string;
  startDate?: string;
  endDate?: string;
  outletOptions?: SelectOption[];
  onSearchChange: (search: string) => void;
  onOutletChange?: (outletId: string) => void;
  onPaymentStatusChange?: (status: string) => void;
  onOrderTypeChange?: (type: string) => void;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export function OrdersFilter({
  search,
  outletId = "",
  paymentStatus = "",
  orderType = "",
  startDate = "",
  endDate = "",
  outletOptions = [],
  onSearchChange,
  onOutletChange,
  onPaymentStatusChange,
  onOrderTypeChange,
  onStartDateChange,
  onEndDateChange,
  onFilter,
  onReset,
}: OrdersFilterProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localOutlet, setLocalOutlet] = useState(outletId);
  const [localPaymentStatus, setLocalPaymentStatus] = useState(paymentStatus);
  const [localOrderType, setLocalOrderType] = useState(orderType);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
    if (onOutletChange) onOutletChange(localOutlet);
    if (onPaymentStatusChange) onPaymentStatusChange(localPaymentStatus);
    if (onOrderTypeChange) onOrderTypeChange(localOrderType);
    if (onStartDateChange) onStartDateChange(localStartDate);
    if (onEndDateChange) onEndDateChange(localEndDate);
    onFilter();
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalOutlet("");
    setLocalPaymentStatus("");
    setLocalOrderType("");
    setLocalStartDate("");
    setLocalEndDate("");
    onSearchChange("");
    if (onOutletChange) onOutletChange("");
    if (onPaymentStatusChange) onPaymentStatusChange("");
    if (onOrderTypeChange) onOrderTypeChange("");
    if (onStartDateChange) onStartDateChange("");
    if (onEndDateChange) onEndDateChange("");
    onReset();
  };

  const paymentStatusOptions = [
    { value: "", label: "Semua Status Bayar" },
    { value: "PAID", label: "Lunas (Paid)" },
    { value: "PARTIAL", label: "Sebagian (Partial)" },
    { value: "UNPAID", label: "Belum Bayar (Unpaid)" },
    { value: "REFUNDED", label: "Refund" },
  ];

  const orderTypeOptions = [
    { value: "", label: "Semua Tipe Pesanan" },
    { value: "DINE_IN", label: "Dine-In (Makan di Tempat)" },
    { value: "TAKE_AWAY", label: "Take Away (Bungkus)" },
    { value: "DELIVERY", label: "Delivery (Antar)" },
    { value: "DRIVE_THRU", label: "Drive Thru" },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
        <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-primary-400" />
          <span>Filter Transaksi Penjualan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-1.5 xl:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Search className="h-3.5 w-3.5 text-primary-400" />
                <span>Pencarian Kata Kunci</span>
              </label>
              <input
                type="text"
                placeholder="No Order, Faktur, Nama Tamu, Meja..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Store className="h-3.5 w-3.5 text-primary-400" />
                <span>Cabang Outlet</span>
              </label>
              <SearchableSelect
                size="sm"
                options={[{ value: "", label: "Semua Outlet" }, ...outletOptions]}
                value={localOutlet}
                onChange={setLocalOutlet}
                placeholder="Pilih Outlet..."
                clearable={Boolean(localOutlet)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <CreditCard className="h-3.5 w-3.5 text-primary-400" />
                <span>Status Bayar</span>
              </label>
              <SearchableSelect
                size="sm"
                options={paymentStatusOptions}
                value={localPaymentStatus}
                onChange={setLocalPaymentStatus}
                placeholder="Pilih Status..."
                clearable={Boolean(localPaymentStatus)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <ShoppingBag className="h-3.5 w-3.5 text-primary-400" />
                <span>Tipe Pesanan</span>
              </label>
              <SearchableSelect
                size="sm"
                options={orderTypeOptions}
                value={localOrderType}
                onChange={setLocalOrderType}
                placeholder="Pilih Tipe..."
                clearable={Boolean(localOrderType)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                <Calendar className="h-3.5 w-3.5 text-primary-400" />
                <span>Tanggal</span>
              </label>
              <input
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" variant="primary" size="sm" className="gap-1.5 shadow-galaxy-cyan">
              <Search className="h-3.5 w-3.5" />
              <span>Cari</span>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
