"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Printer,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CreditCard,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReportsFilter } from "@/modules/reports";
import {
  reportsService,
  outletsService,
  SalesReportData,
  ProductPerformanceData,
  ShiftAuditData,
  PaymentMethodReportData,
} from "@/services";
import { exportToExcelCsv } from "@/lib/export-excel";
import type { Outlet } from "@/types";

export default function ReportsHubPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "products" | "shifts" | "payments">("sales");
  const [loading, setLoading] = useState(false);

  // Filter states
  const [datePreset, setDatePreset] = useState<string>("30d");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [outletId, setOutletId] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("ALL");
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  // Report datasets
  const [salesData, setSalesData] = useState<SalesReportData | null>(null);
  const [productData, setProductData] = useState<ProductPerformanceData | null>(null);
  const [shiftData, setShiftData] = useState<ShiftAuditData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentMethodReportData | null>(null);

  // Search in table
  const [searchQuery, setSearchQuery] = useState("");

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

  // Set date preset helper
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

  // Initial preset application
  useEffect(() => {
    applyPreset("30d");
  }, []);

  // Fetch report data based on active tab and filters
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    const params = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      outletId: outletId || undefined,
      paymentStatus: paymentStatus !== "ALL" ? paymentStatus : undefined,
    };

    try {
      if (activeTab === "sales") {
        const res = await reportsService.getSalesReport(params);
        if (res.data) setSalesData(res.data);
      } else if (activeTab === "products") {
        const res = await reportsService.getProductPerformanceReport(params);
        if (res.data) setProductData(res.data);
      } else if (activeTab === "shifts") {
        const res = await reportsService.getShiftAuditReport(params);
        if (res.data) setShiftData(res.data);
      } else if (activeTab === "payments") {
        const res = await reportsService.getPaymentMethodReport(params);
        if (res.data) setPaymentData(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat data laporan:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate, outletId, paymentStatus]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleResetFilters = () => {
    applyPreset("30d");
    setOutletId("");
    setPaymentStatus("ALL");
    setSearchQuery("");
  };

  // Handle Export CSV
  const handleExport = () => {
    if (activeTab === "sales" && salesData?.orders) {
      exportToExcelCsv(
        "Laporan_Penjualan_POS",
        [
          { header: "No. Pesanan", accessor: (i) => i.orderNumber },
          { header: "No. Invoice", accessor: (i) => i.invoiceNumber || "-" },
          { header: "Tanggal", accessor: (i) => i.date },
          { header: "Waktu", accessor: (i) => i.time },
          { header: "Outlet", accessor: (i) => i.outletName },
          { header: "Kasir", accessor: (i) => i.cashierName },
          { header: "Saluran", accessor: (i) => i.channelName },
          { header: "Tipe", accessor: (i) => i.orderType },
          { header: "Status Bayar", accessor: (i) => i.paymentStatus },
          { header: "Subtotal (Rp)", accessor: (i) => i.subtotal },
          { header: "Diskon (Rp)", accessor: (i) => i.discountAmount },
          { header: "Pajak (Rp)", accessor: (i) => i.taxAmount },
          { header: "Total Omzet (Rp)", accessor: (i) => i.totalAmount },
          { header: "Total HPP (Rp)", accessor: (i) => i.totalCost },
          { header: "Laba Kotor (Rp)", accessor: (i) => i.grossProfit },
          { header: "Margin (%)", accessor: (i) => i.profitMarginPercent },
          { header: "Metode Bayar", accessor: (i) => i.paymentMethods },
        ],
        salesData.orders,
      );
    } else if (activeTab === "products" && productData?.products) {
      exportToExcelCsv(
        "Laporan_Produk_Terlaris",
        [
          { header: "Kode Produk", accessor: (i) => i.productCode },
          { header: "Nama Produk", accessor: (i) => i.productName },
          { header: "Kategori", accessor: (i) => i.categoryName },
          { header: "Satuan", accessor: (i) => i.unitName },
          { header: "Qty Terjual", accessor: (i) => i.quantitySold },
          { header: "Total Omzet (Rp)", accessor: (i) => i.totalRevenue },
          { header: "Total HPP (Rp)", accessor: (i) => i.totalCost },
          { header: "Laba Kotor (Rp)", accessor: (i) => i.grossProfit },
          { header: "Margin (%)", accessor: (i) => i.profitMarginPercent },
          { header: "Pangsa Omzet (%)", accessor: (i) => i.revenueSharePercent },
        ],
        productData.products,
      );
    } else if (activeTab === "shifts" && shiftData?.shifts) {
      exportToExcelCsv(
        "Laporan_Shift_Audit_Kasir",
        [
          { header: "Kode Shift", accessor: (i) => i.shiftCode },
          { header: "Outlet", accessor: (i) => i.outletName },
          { header: "Register Kasir", accessor: (i) => i.registerName },
          { header: "Nama Kasir", accessor: (i) => i.cashierName },
          { header: "Mulai Shift", accessor: (i) => new Date(i.openedAt).toLocaleString("id-ID") },
          { header: "Selesai Shift", accessor: (i) => (i.closedAt ? new Date(i.closedAt).toLocaleString("id-ID") : "Aktif") },
          { header: "Status", accessor: (i) => i.status },
          { header: "Modal Awal (Rp)", accessor: (i) => i.openingCash },
          { header: "Kas Masuk (Rp)", accessor: (i) => i.totalCashIn },
          { header: "Kas Keluar (Rp)", accessor: (i) => i.totalCashOut },
          { header: "Penjualan Kas (Rp)", accessor: (i) => i.totalSalesAmount },
          { header: "Ekspektasi Uang (Rp)", accessor: (i) => i.expectedCash },
          { header: "Fisik Uang (Rp)", accessor: (i) => i.actualCash ?? "-" },
          { header: "Selisih Uang (Rp)", accessor: (i) => i.cashDifference ?? "-" },
          { header: "Catatan Closing", accessor: (i) => i.closingNotes || "-" },
        ],
        shiftData.shifts,
      );
    } else if (activeTab === "payments" && paymentData?.paymentMethods) {
      exportToExcelCsv(
        "Laporan_Metode_Pembayaran",
        [
          { header: "Kode Metode", accessor: (i) => i.methodCode },
          { header: "Nama Metode", accessor: (i) => i.methodName },
          { header: "Tipe", accessor: (i) => i.methodType },
          { header: "Total Transaksi", accessor: (i) => i.transactionCount },
          { header: "Total Nominal (Rp)", accessor: (i) => i.totalAmount },
          { header: "Pangsa (%)", accessor: (i) => i.sharePercent },
        ],
        paymentData.paymentMethods,
      );
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitleBox title="Laporan & Rekapitulasi POS" category="Reports" />
        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReportData}
            isLoading={loading}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </Button>
        </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="flex border-b border-slate-200/80 dark:border-galaxy-border/80 gap-2 text-xs font-semibold overflow-x-auto print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("sales")}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap font-heading ${
            activeTab === "sales"
              ? "border-primary-400 text-primary-400 font-semibold"
              : "border-transparent text-slate-500 dark:text-galaxy-muted hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <DollarSign className="w-4 h-4 text-primary-400" />
          <span>Penjualan & Laba / HPP</span>
          {salesData?.summary && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-galaxy-input text-2xs font-mono">
              {salesData.summary.totalOrdersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap font-heading ${
            activeTab === "products"
              ? "border-primary-400 text-primary-400 font-semibold"
              : "border-transparent text-slate-500 dark:text-galaxy-muted hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Package className="w-4 h-4 text-primary-400" />
          <span>Kinerja Produk & Kategori</span>
          {productData?.summary && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-galaxy-input text-2xs font-mono">
              {productData.summary.totalUniqueProducts}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("shifts")}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap font-heading ${
            activeTab === "shifts"
              ? "border-primary-400 text-primary-400 font-semibold"
              : "border-transparent text-slate-500 dark:text-galaxy-muted hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4 text-primary-400" />
          <span>Rekap Shift & Kasir Audit</span>
          {shiftData?.totalShifts !== undefined && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-galaxy-input text-2xs font-mono">
              {shiftData.totalShifts}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap font-heading ${
            activeTab === "payments"
              ? "border-primary-400 text-primary-400 font-semibold"
              : "border-transparent text-slate-500 dark:text-galaxy-muted hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4 text-primary-400" />
          <span>Metode Pembayaran</span>
        </button>
      </div>

      {/* 3. Kartu Filter Standar Sesuai pos-development-standard */}
      <ReportsFilter
        startDate={startDate}
        endDate={endDate}
        outletId={outletId}
        paymentStatus={paymentStatus}
        datePreset={datePreset}
        outlets={outlets}
        showPaymentStatus={activeTab === "sales"}
        onStartDateChange={(val) => {
          setStartDate(val);
          setDatePreset("custom");
        }}
        onEndDateChange={(val) => {
          setEndDate(val);
          setDatePreset("custom");
        }}
        onOutletChange={setOutletId}
        onPaymentStatusChange={setPaymentStatus}
        onPresetSelect={applyPreset}
        onFilter={fetchReportData}
        onReset={handleResetFilters}
      />

      {/* 4. Konten Tab Data */}

      {/* TAB 1: PENJUALAN & LABA */}
      {activeTab === "sales" && (
        <div className="space-y-5">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Total Omzet Penjualan
                </p>
                <h4 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                  {formatRupiah(salesData?.summary?.totalRevenue)}
                </h4>
                <p className="text-2xs font-mono text-slate-500 dark:text-galaxy-muted mt-1">
                  {salesData?.summary?.totalOrdersCount || 0} struk transaksi
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Total Modal / HPP
                </p>
                <h4 className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                  {formatRupiah(salesData?.summary?.totalCogs)}
                </h4>
                <p className="text-2xs text-slate-500 dark:text-galaxy-muted mt-1">
                  Beban pokok resep & barang
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Laba Kotor (Gross Profit)
                </p>
                <h4 className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatRupiah(salesData?.summary?.grossProfit)}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 font-mono text-2xs">
                  <span className="px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                    Margin {salesData?.summary?.profitMarginPercent || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4 space-y-1.5">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Diskon & Pajak PB1
                </p>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-slate-500 dark:text-galaxy-muted">Diskon:</span>
                  <span className="font-mono font-semibold text-rose-500">
                    {formatRupiah(salesData?.summary?.totalDiscount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-galaxy-muted">Pajak (PB1):</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                    {formatRupiah(salesData?.summary?.totalTax)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Card Standar */}
          <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
            <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
                  Daftar Transaksi Penjualan Lengkap
                </CardTitle>
                <p className="text-2xs text-slate-500 dark:text-galaxy-muted mt-0.5">
                  Rincian transaksi invoice kasir beserta snapshot HPP modal dan laba kotor
                </p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari invoice / kasir..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-60 rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 transition-colors"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-galaxy-thead text-slate-500 dark:text-galaxy-muted uppercase font-heading text-2xs tracking-wider border-b border-slate-200/80 dark:border-galaxy-border/80">
                  <tr>
                    <th className="py-2.5 px-4">Invoice / Order</th>
                    <th className="py-2.5 px-3">Tanggal & Waktu</th>
                    <th className="py-2.5 px-3">Outlet & Kasir</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-right">Total Omzet</th>
                    <th className="py-2.5 px-3 text-right">HPP (Modal)</th>
                    <th className="py-2.5 px-3 text-right">Laba Kotor</th>
                    <th className="py-2.5 px-3 text-center">Margin %</th>
                    <th className="py-2.5 px-4">Metode Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/80 text-slate-700 dark:text-slate-200">
                  {(salesData?.orders || [])
                    .filter((o) =>
                      searchQuery
                        ? o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                        : true,
                    )
                    .map((o) => (
                      <tr key={o.orderId} className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors">
                        <td className="py-2.5 px-4 font-mono">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {o.invoiceNumber || o.orderNumber}
                          </div>
                          {o.invoiceNumber && (
                            <div className="text-2xs text-slate-400">{o.orderNumber}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <div>{o.date}</div>
                          <div className="text-2xs text-slate-400">{o.time}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{o.outletName}</div>
                          <div className="text-2xs text-slate-400">{o.cashierName}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-2xs px-2 py-0.5 rounded bg-slate-100 dark:bg-galaxy-input text-slate-600 dark:text-slate-300 font-medium">
                            {o.orderType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium">
                          {formatRupiah(o.subtotal)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatRupiah(o.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                          {formatRupiah(o.totalCost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(o.grossProfit)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className="px-1.5 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                            {o.profitMarginPercent}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-2xs">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {o.paymentMethods}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {(!salesData?.orders || salesData.orders.length === 0) && (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        Tidak ada transaksi ditemukan pada rentang filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: PRODUK & KATEGORI */}
      {activeTab === "products" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Menu Unik Terjual
                </p>
                <h4 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                  {productData?.summary?.totalUniqueProducts || 0}
                </h4>
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Total Qty Terjual
                </p>
                <h4 className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                  {productData?.summary?.grandTotalQty || 0}
                </h4>
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Total Omzet Menu
                </p>
                <h4 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                  {formatRupiah(productData?.summary?.grandTotalRevenue)}
                </h4>
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Total Laba Kotor Menu
                </p>
                <h4 className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatRupiah(productData?.summary?.grandTotalProfit)}
                </h4>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
            <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
              <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
                Laporan Kinerja Menu & Kontribusi Margin
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-galaxy-thead text-slate-500 dark:text-galaxy-muted uppercase font-heading text-2xs tracking-wider border-b border-slate-200/80 dark:border-galaxy-border/80">
                  <tr>
                    <th className="py-2.5 px-4">Menu & Kode</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Qty Terjual</th>
                    <th className="py-2.5 px-3 text-right">Total Omzet</th>
                    <th className="py-2.5 px-3 text-right">Total HPP</th>
                    <th className="py-2.5 px-3 text-right">Laba Kotor</th>
                    <th className="py-2.5 px-3 text-center">Margin %</th>
                    <th className="py-2.5 px-4 text-center">Pangsa Omzet %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/80 text-slate-700 dark:text-slate-200">
                  {(productData?.products || []).map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{p.productName}</div>
                        <div className="text-2xs text-slate-400 font-mono">{p.productCode}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-galaxy-input text-2xs font-medium text-slate-600 dark:text-slate-300">
                          {p.categoryName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {p.quantitySold} <span className="font-normal text-slate-400">{p.unitName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">{formatRupiah(p.totalRevenue)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                        {formatRupiah(p.totalCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(p.grossProfit)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className="px-1.5 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                          {p.profitMarginPercent}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-mono">
                          <div className="w-12 bg-slate-100 dark:bg-galaxy-input rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary-500 dark:bg-primary-400 h-1.5 rounded-full"
                              style={{ width: `${Math.min(p.revenueSharePercent, 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-2xs text-slate-600 dark:text-slate-300">
                            {p.revenueSharePercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!productData?.products || productData.products.length === 0) && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Belum ada item terjual pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: SHIFT & KASIR AUDIT */}
      {activeTab === "shifts" && (
        <div className="space-y-5">
          <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
            <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
              <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
                Rekapitulasi Shift Kasir & Audit Selisih Laci Uang (Discrepancy)
              </CardTitle>
              <p className="text-2xs text-slate-500 dark:text-galaxy-muted mt-0.5">
                Pemeriksaan modal kasir, arus kas masuk/keluar, dan verifikasi uang fisik vs sistem saat tutup shift
              </p>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-galaxy-thead text-slate-500 dark:text-galaxy-muted uppercase font-heading text-2xs tracking-wider border-b border-slate-200/80 dark:border-galaxy-border/80">
                  <tr>
                    <th className="py-2.5 px-4">Shift & Register</th>
                    <th className="py-2.5 px-3">Kasir</th>
                    <th className="py-2.5 px-3">Waktu Shift</th>
                    <th className="py-2.5 px-3 text-right">Modal Awal</th>
                    <th className="py-2.5 px-3 text-right">Penjualan Kas</th>
                    <th className="py-2.5 px-3 text-right">Ekspektasi Uang</th>
                    <th className="py-2.5 px-3 text-right">Uang Fisik</th>
                    <th className="py-2.5 px-3 text-right">Selisih</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/80 text-slate-700 dark:text-slate-200">
                  {(shiftData?.shifts || []).map((s) => (
                    <tr key={s.shiftId} className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{s.shiftCode}</div>
                        <div className="text-2xs text-slate-400">
                          {s.outletName} • {s.registerName}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {s.cashierName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-2xs">
                        <div>Buka: {new Date(s.openedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                        <div className="text-slate-400">
                          Tutup:{" "}
                          {s.closedAt
                            ? new Date(s.closedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                            : "Masih Buka"}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">{formatRupiah(s.openingCash)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">{formatRupiah(s.totalSalesAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                        {formatRupiah(s.expectedCash)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        {s.actualCash !== null ? formatRupiah(s.actualCash) : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {s.cashDifference !== null ? (
                          <span
                            className={
                              s.cashDifference === 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : s.cashDifference > 0
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-rose-600 dark:text-rose-400 font-bold"
                            }
                          >
                            {s.cashDifference > 0 ? `+${formatRupiah(s.cashDifference)}` : formatRupiah(s.cashDifference)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-2xs font-semibold border ${
                            s.status === "CLOSED"
                              ? "bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-galaxy-input dark:text-slate-300 dark:border-galaxy-border/80"
                              : s.status === "OPEN"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 animate-pulse"
                              : "bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!shiftData?.shifts || shiftData.shifts.length === 0) && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        Belum ada sesi shift tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: METODE PEMBAYARAN */}
      {activeTab === "payments" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Total Transaksi Masuk
                </p>
                <h4 className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                  {paymentData?.summary?.totalTransactions || 0}
                </h4>
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xs font-semibold tracking-wider text-slate-500 dark:text-galaxy-muted uppercase font-heading">
                  Total Akumulasi Pembayaran
                </p>
                <h4 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatRupiah(paymentData?.summary?.grandTotalAmount)}
                </h4>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm">
            <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-3.5">
              <CardTitle className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
                Pangsa & Frekuensi Saluran Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-galaxy-thead text-slate-500 dark:text-galaxy-muted uppercase font-heading text-2xs tracking-wider border-b border-slate-200/80 dark:border-galaxy-border/80">
                  <tr>
                    <th className="py-2.5 px-4">Metode Pembayaran</th>
                    <th className="py-2.5 px-3">Tipe Saluran</th>
                    <th className="py-2.5 px-3 text-center">Jumlah Transaksi</th>
                    <th className="py-2.5 px-3 text-right">Total Akumulasi</th>
                    <th className="py-2.5 px-4 text-center">Pangsa Pasar (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/80 text-slate-700 dark:text-slate-200">
                  {(paymentData?.paymentMethods || []).map((m) => (
                    <tr key={m.methodId} className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{m.methodName}</div>
                        <div className="text-2xs text-slate-400 font-mono">{m.methodCode}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-galaxy-input text-2xs font-medium text-slate-600 dark:text-slate-300">
                          {m.methodType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{m.transactionCount} kali</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatRupiah(m.totalAmount)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 font-mono">
                          <div className="w-16 bg-slate-100 dark:bg-galaxy-input rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 dark:bg-emerald-400 h-1.5 rounded-full"
                              style={{ width: `${Math.min(m.sharePercent, 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-2xs text-slate-700 dark:text-slate-200">
                            {m.sharePercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!paymentData?.paymentMethods || paymentData.paymentMethods.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Belum ada pembayaran yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
