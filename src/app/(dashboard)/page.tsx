"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  ArrowRight,
  RefreshCw,
  Package,
  Calendar,
  Store,
  Filter,
  Search,
  RotateCcw,
  Percent,
} from "lucide-react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { DateRangePickerInput } from "@/components/forms/DateRangePickerInput";
import Chart from "@/components/ui/Chart";
import {
  reportsService,
  outletsService,
  DashboardMetricsData,
} from "@/services";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";
import type { Outlet, SelectOption } from "@/types";

export default function AnalyticsDashboardPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardMetricsData | null>(null);

  // Filter States
  const [datePreset, setDatePreset] = useState<string>("30d");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [outletId, setOutletId] = useState<string>("");
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const formatRupiah = (val: number | null | undefined) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Load Outlets on Mount
  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const res = await outletsService.findAll({ limit: 100 });
        if (res.data) setOutlets(res.data);
      } catch (err) {
        console.error("Gagal memuat outlet:", err);
      }
    };
    loadOutlets();
  }, []);

  // Preset Helper
  const applyPreset = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

    if (preset === "today") {
      setStartDate(toDateStr(today));
      setEndDate(toDateStr(today));
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setStartDate(toDateStr(y));
      setEndDate(toDateStr(y));
    } else if (preset === "7d") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setStartDate(toDateStr(past));
      setEndDate(toDateStr(today));
    } else if (preset === "30d") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setStartDate(toDateStr(past));
      setEndDate(toDateStr(today));
    } else if (preset === "month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(toDateStr(startOfMonth));
      setEndDate(toDateStr(today));
    } else if (preset === "all") {
      setStartDate("");
      setEndDate("");
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportsService.getDashboardMetrics({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        outletId: outletId || undefined,
      });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat dashboard POS:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, outletId]);

  useEffect(() => {
    setMounted(true);
    applyPreset("30d");
  }, []);

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [loadData, mounted]);

  const handleResetFilters = () => {
    applyPreset("30d");
    setOutletId("");
  };

  const isDark = mounted && resolvedTheme === "dark";

  // Preset options
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

  // Trend Chart Config
  const trendDates = data?.salesTrend?.map((t) => t.date) || [];
  const trendRevenues = data?.salesTrend?.map((t) => t.revenue) || [];
  const trendCogs = data?.salesTrend?.map((t) => t.cogs) || [];

  const trendSeries = [
    { name: "Omzet (Penjualan)", data: trendRevenues },
    { name: "HPP (Modal Bahan)", data: trendCogs },
  ];

  const trendOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 320,
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    colors: ["#28a77b", "#e07a5f"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: trendDates.length > 0 ? trendDates : ["Belum ada data"],
      labels: {
        style: {
          colors: isDark ? "#8597a4" : "#64748b",
          fontSize: "11px",
          fontFamily: "inherit",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `Rp ${(val / 1000).toFixed(0)}k`,
        style: {
          colors: isDark ? "#8597a4" : "#64748b",
          fontSize: "11px",
          fontFamily: "inherit",
        },
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => formatRupiah(val),
      },
    },
    grid: {
      borderColor: isDark ? "#20323f" : "#f1f5f9",
      strokeDashArray: 4,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: isDark ? "#d2dce3" : "#334155",
      },
    },
  };

  // Payment Donut Config
  const paymentLabels = data?.paymentBreakdown?.map((p) => p.name) || [];
  const paymentSeries = data?.paymentBreakdown?.map((p) => p.amount) || [];

  const paymentOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 300,
      fontFamily: "inherit",
    },
    labels: paymentLabels.length > 0 ? paymentLabels : ["Tidak ada transaksi"],
    colors: ["#28a77b", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      labels: {
        colors: isDark ? "#d2dce3" : "#334155",
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => formatRupiah(val),
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Omzet",
              color: isDark ? "#8597a4" : "#64748b",
              formatter: () => formatRupiah(data?.summary?.totalRevenue || 0),
            },
            value: {
              color: isDark ? "#d2dce3" : "#0f172a",
              fontWeight: 700,
            },
          },
        },
      },
    },
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitleBox title="Ringkasan Bisnis & Analytics" category="Dashboards" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={loading}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </Button>
          <Link href="/reports">
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 shadow-galaxy-cyan"
            >
              <span>Buka Laporan Penuh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Kartu Filter Standar Velzon Galaxy */}
      <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
        <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
          <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-primary-400" />
            <span>Filter Analitik & Dasbor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {/* Preset Buttons */}
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
                  onClick={() => applyPreset(p.id)}
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

          {/* Detailed Inputs */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadData();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
                    setStartDate(s);
                    setEndDate(e);
                    if (preset) applyPreset(preset);
                  }}
                  placeholder="Pilih rentang tanggal..."
                  size="sm"
                />
              </div>

              {/* SearchableSelect for Outlet */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                  <Store className="h-3.5 w-3.5 text-primary-400" />
                  <span>Outlet Cabang</span>
                </label>
                <SearchableSelect
                  size="sm"
                  options={outletOptions}
                  value={outletId}
                  onChange={setOutletId}
                  placeholder="Pilih Outlet..."
                  clearable={Boolean(outletId)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="gap-1.5 shadow-galaxy-cyan"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Terapkan Filter</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. Row 1: KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Omzet */}
        <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Total Omzet Penjualan
                </p>
                <h3 className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                  {formatRupiah(data?.summary?.totalRevenue || 0)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-400/10 text-primary-400 border border-primary-400/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-2xs text-slate-500 dark:text-galaxy-muted font-mono">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {data?.summary?.totalOrdersCount || 0}
              </span>{" "}
              transaksi selesai
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total HPP */}
        <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Total Modal / HPP
                </p>
                <h3 className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                  {formatRupiah(data?.summary?.totalCogs || 0)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-2xs text-slate-500 dark:text-galaxy-muted font-mono">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {data?.summary?.totalItemsCount || 0}
              </span>{" "}
              item terjual
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Laba Kotor */}
        <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Laba Kotor (Gross Profit)
                </p>
                <h3 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatRupiah(data?.summary?.grossProfit || 0)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-2xs font-mono">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                Margin {data?.summary?.profitMarginPercent || 0}%
              </span>
              <span className="text-slate-500 dark:text-galaxy-muted">dari total omzet</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Rata-rata Belanja (AOV) */}
        <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Rata-rata Belanja (AOV)
                </p>
                <h3 className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                  {formatRupiah(data?.summary?.averageOrderValue || 0)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-2xs text-slate-500 dark:text-galaxy-muted">
              <span>Per transaksi struk kasir</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Row 2: Charts (Sales Trend & Payment Share) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Trend Area Chart (col 8) */}
        <div className="xl:col-span-8">
          <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
            <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
                  Tren Penjualan & Margin Keuntungan
                </CardTitle>
                <p className="text-2xs text-slate-500 dark:text-galaxy-muted mt-0.5">
                  Perbandingan grafik omzet pendapatan vs beban modal harian
                </p>
              </div>
              <Link
                href="/reports"
                className="text-2xs font-semibold text-primary-400 hover:underline flex items-center gap-1 font-heading"
              >
                <span>Lihat Detail</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-5">
              <Chart options={trendOptions} series={trendSeries} type="area" height={320} />
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Donut (col 4) */}
        <div className="xl:col-span-4">
          <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
            <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
              <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
                Pangsa Metode Pembayaran
              </CardTitle>
              <p className="text-2xs text-slate-500 dark:text-galaxy-muted mt-0.5">
                Distribusi per cash, QRIS, debit, & transfer
              </p>
            </CardHeader>
            <CardContent className="p-5">
              {paymentSeries.length > 0 ? (
                <Chart options={paymentOptions} series={paymentSeries} type="donut" height={320} />
              ) : (
                <div className="h-[320px] flex items-center justify-center text-xs text-slate-400">
                  Belum ada transaksi pembayaran
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. Row 3: Leaderboard Top Products & Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Top Selling Products (col 7) */}
        <div className="xl:col-span-7">
          <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
            <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
                  Produk Terlaris & Kontribusi Laba
                </CardTitle>
                <p className="text-2xs text-slate-500 dark:text-galaxy-muted mt-0.5">
                  Menu teratas berdasarkan total perolehan omzet
                </p>
              </div>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded font-heading bg-primary-400/10 text-primary-400 border border-primary-400/25">
                Top Performer
              </span>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-galaxy-thead text-slate-500 dark:text-galaxy-muted uppercase font-heading text-2xs tracking-wider border-b border-slate-200/80 dark:border-galaxy-border/80">
                  <tr>
                    <th className="py-2.5 px-4">Menu</th>
                    <th className="py-2.5 px-3 text-center">Terjual</th>
                    <th className="py-2.5 px-3 text-right">Omzet</th>
                    <th className="py-2.5 px-3 text-right">Laba Kotor</th>
                    <th className="py-2.5 px-4 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/80 text-slate-700 dark:text-slate-200">
                  {(data?.topProducts || []).map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</div>
                        <div className="text-2xs text-slate-400 font-mono">{p.code}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold">{p.qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">{formatRupiah(p.revenue)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(p.profit)}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">
                        <span className="inline-block px-1.5 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                          {p.marginPercent.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.topProducts || data.topProducts.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        Belum ada item terjual pada periode ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders (col 5) */}
        <div className="xl:col-span-5">
          <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
            <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
                  Transaksi Terkini
                </CardTitle>
                <p className="text-2xs text-slate-500 dark:text-galaxy-muted mt-0.5">
                  10 pesanan terakhir di kasir
                </p>
              </div>
              <Link
                href="/orders"
                className="text-2xs font-semibold text-primary-400 hover:underline flex items-center gap-1 font-heading"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-galaxy-thead text-slate-500 dark:text-galaxy-muted uppercase font-heading text-2xs tracking-wider border-b border-slate-200/80 dark:border-galaxy-border/80">
                  <tr>
                    <th className="py-2.5 px-4">No. Order</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/80 text-slate-700 dark:text-slate-200">
                  {(data?.recentOrders || []).map((o) => (
                    <tr key={o.orderId} className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {o.orderNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-2xs px-2 py-0.5 rounded bg-slate-100 dark:bg-galaxy-input text-slate-600 dark:text-slate-300 font-medium">
                          {o.orderType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-2xs px-1.5 py-0.5 rounded font-semibold border ${
                            o.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                        {formatRupiah(o.totalAmount)}
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentOrders || data.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400">
                        Belum ada riwayat pesanan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
