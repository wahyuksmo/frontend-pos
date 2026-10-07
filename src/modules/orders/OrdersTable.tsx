"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  MoreVertical,
  Eye,
  CreditCard,
  Ban,
  FileSpreadsheet,
  Receipt,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  Car,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Order, PaginationMeta } from "@/types";

export interface OrdersTableProps {
  data: Order[];
  meta?: PaginationMeta;
  loading: boolean;
  page: number;
  pageSize: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreate?: () => void;
  onOpenDetail: (order: Order) => void;
  onOpenPayment: (order: Order) => void;
  onVoidOrder: (order: Order) => void;
  onExportCsv: () => void;
}

export function OrdersTable({
  data,
  meta,
  loading,
  page,
  pageSize,
  activeTab,
  onTabChange,
  onPageChange,
  onPageSizeChange,
  onOpenCreate,
  onOpenDetail,
  onOpenPayment,
  onVoidOrder,
  onExportCsv,
}: OrdersTableProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<{
    item: Order;
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeMenu) return;
    const handleClose = () => setActiveMenu(null);
    window.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [activeMenu]);

  const handleToggleMenu = (item: Order, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenu?.item.orderId === item.orderId) {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 120;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight;
    const top = openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const left = Math.max(10, rect.right - 180);

    setActiveMenu({ item, top, left });
  };

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderTypeBadge = (type: string) => {
    switch (type) {
      case "DINE_IN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
            <UtensilsCrossed className="h-3 w-3" /> Dine-In
          </span>
        );
      case "TAKE_AWAY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
            <ShoppingBag className="h-3 w-3" /> Take Away
          </span>
        );
      case "DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
            <Truck className="h-3 w-3" /> Delivery
          </span>
        );
      case "DRIVE_THRU":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
            <Car className="h-3 w-3" /> Drive Thru
          </span>
        );
      default:
        return <span>{type}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            Lunas
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
            Sebagian
          </span>
        );
      case "UNPAID":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            Belum Bayar
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-300">
            Refund
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            Selesai
          </span>
        );
      case "OPEN":
      case "HELD":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-600 border border-sky-200/60 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
            Meja Aktif
          </span>
        );
      case "VOIDED":
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            Void
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const total = meta?.total ?? data.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const tabs = [
    { key: "ALL", label: "Semua Pesanan" },
    { key: "PAID", label: "Selesai (Lunas)" },
    { key: "OPEN", label: "Open / Meja Aktif" },
    { key: "VOIDED", label: "Dibatalkan (Void)" },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100 font-heading">
            Daftar Transaksi Penjualan (POS Orders)
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Riwayat struk kasir, tagihan meja restoran, dan pembayaran multi-tender
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </Button>
          {onOpenCreate && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onOpenCreate}
              className="gap-1.5 shadow-galaxy-cyan"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Transaksi Kasir</span>
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Tabs navigation inspired by Velzon Galaxy orders */}
      <div className="border-b border-slate-200/80 dark:border-galaxy-border/80 px-5 flex gap-4 text-xs font-heading overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-primary-400 text-primary-500 dark:text-primary-400 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-galaxy-border/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded border border-slate-300 dark:border-galaxy-border bg-white dark:bg-galaxy-input px-2 text-xs font-mono focus:outline-none focus:border-primary-400"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-slate-500">entri</span>
          </div>
          <div className="text-slate-500 font-mono">
            Total {total} transaksi
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-galaxy-border/80 bg-slate-50/70 dark:bg-galaxy-thead text-slate-700 dark:text-slate-200 font-heading">
                <th className="px-4 py-3 font-semibold">No. Order & Faktur</th>
                <th className="px-4 py-3 font-semibold">Waktu & Cabang</th>
                <th className="px-4 py-3 font-semibold">Tipe & Meja</th>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold text-center">Item</th>
                <th className="px-4 py-3 font-semibold text-right">Total Akhir</th>
                <th className="px-4 py-3 font-semibold">Status Bayar</th>
                <th className="px-4 py-3 font-semibold">Status Pesanan</th>
                <th className="px-4 py-3 font-semibold text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <LoadingSpinner className="mx-auto h-7 w-7 text-primary-400" />
                    <p className="mt-2 text-xs text-slate-500">Memuat transaksi pesanan...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Receipt className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-1" />
                    <p>Belum ada transaksi pesanan yang sesuai kriteria.</p>
                  </td>
                </tr>
              ) : (
                data.map((order) => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-slate-50/70 dark:hover:bg-galaxy-hover/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono">
                      <div className="font-semibold text-primary-500 dark:text-primary-400">
                        {order.orderNumber}
                      </div>
                      {order.invoiceNumber ? (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Receipt className="h-3 w-3" /> {order.invoiceNumber}
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-500 italic">Belum Cetak Faktur</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-800 dark:text-slate-100">
                        {formatDate(order.orderedAt)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.outlet?.outletName || "Semua Outlet"}
                      </div>
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      <div>{getOrderTypeBadge(order.orderType)}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.table?.tableName ? `Meja ${order.table.tableName}` : order.guestName || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {order.customer?.customerName || order.guestName || "Walk-in Guest"}
                      </div>
                      {order.customer?.phone && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          {order.customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-medium">
                      {order._count?.items ?? order.items?.length ?? 1}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>
                    <td className="px-4 py-3">
                      {getOrderStatusBadge(order.orderStatus)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleToggleMenu(order, e)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-300 dark:hover:bg-galaxy-hover"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-galaxy-border/40 text-xs">
          <div className="text-slate-500 font-mono">
            Menampilkan {startItem} sampai {endItem} dari {total} entri
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 px-3 text-xs"
            >
              Sebelumnya
            </Button>
            <span className="px-2 text-slate-600 dark:text-slate-300 font-mono">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 px-3 text-xs"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Floating Action Menu Portal (Anti-AI Slop: NEVER clipped by overflow-x-auto) */}
      {mounted &&
        activeMenu &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: `${activeMenu.top}px`,
              left: `${activeMenu.left}px`,
              zIndex: 9999,
            }}
            className="w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-galaxy-border dark:bg-galaxy-card text-xs font-heading animate-in fade-in zoom-in-95 duration-100"
          >
            <button
              type="button"
              onClick={() => {
                const item = activeMenu.item;
                setActiveMenu(null);
                onOpenDetail(item);
              }}
              className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-galaxy-hover"
            >
              <Eye className="h-3.5 w-3.5 text-primary-400" />
              <span>Detail & Struk</span>
            </button>

            {activeMenu.item.paymentStatus !== "PAID" &&
              activeMenu.item.orderStatus !== "VOIDED" && (
                <button
                  type="button"
                  onClick={() => {
                    const item = activeMenu.item;
                    setActiveMenu(null);
                    onOpenPayment(item);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Bayar Tagihan</span>
                </button>
              )}

            {activeMenu.item.orderStatus !== "VOIDED" && (
              <button
                type="button"
                onClick={() => {
                  const item = activeMenu.item;
                  setActiveMenu(null);
                  onVoidOrder(item);
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Void Pesanan</span>
              </button>
            )}
          </div>,
          document.body,
        )}
    </Card>
  );
}
