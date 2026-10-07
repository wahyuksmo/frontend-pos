"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { OrdersFilter, OrdersTable, OrderDetailModal } from "@/modules/orders";
import {
  ordersService,
  outletsService,
  paymentMethodsService,
} from "@/services";
import { showErrorAlert, showConfirmDialog, showSuccessAlert } from "@/lib/sweetalert";
import type { Order, PaginationMeta, SelectOption } from "@/types";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  // Filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [outletId, setOutletId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [orderType, setOrderType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Options for select
  const [outletOptions, setOutletOptions] = useState<SelectOption[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<SelectOption[]>([]);

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load auxiliary options
  useEffect(() => {
    outletsService.findAll({ limit: 100, isActive: "Y" }).then((res) => {
      setOutletOptions((res.data || []).map((o) => ({ value: o.outletId, label: o.outletName })));
    }).catch(() => {});

    paymentMethodsService.findAll({ limit: 100, isActive: "Y" }).then((res) => {
      setPaymentMethodOptions((res.data || []).map((pm) => ({ value: pm.paymentMethodId, label: `${pm.methodName} (${pm.methodType})` })));
    }).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let resolvedOrderStatus: string | undefined = undefined;
      let resolvedPaymentStatus: string | undefined = paymentStatus || undefined;

      if (activeTab === "PAID") {
        resolvedPaymentStatus = "PAID";
        resolvedOrderStatus = "COMPLETED";
      } else if (activeTab === "OPEN") {
        resolvedOrderStatus = "OPEN";
      } else if (activeTab === "VOIDED") {
        resolvedOrderStatus = "VOIDED";
      }

      const res = await ordersService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        outletId: outletId || undefined,
        paymentStatus: resolvedPaymentStatus,
        orderStatus: resolvedOrderStatus,
        orderType: orderType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setOrders(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Transaksi", err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, search, outletId, paymentStatus, orderType, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleOpenDetail = async (order: Order) => {
    try {
      const res = await ordersService.findById(order.orderId);
      setSelectedOrder(res.data);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Detail", err.message || "Gagal memuat detail pesanan.");
    }
  };

  const handleAddPayment = async (
    orderId: string,
    paymentData: { paymentMethodId: string; amount: number; tenderedAmount?: number; referenceNumber?: string },
  ) => {
    try {
      await ordersService.addPayment(orderId, {
        payments: [paymentData],
      });
      showSuccessAlert("Pembayaran Berhasil", "Pembayaran pesanan berhasil diproses.");
      // Refresh modal and list
      const updated = await ordersService.findById(orderId);
      setSelectedOrder(updated.data);
      fetchData();
    } catch (err: any) {
      showErrorAlert("Gagal Memproses Pembayaran", err.message || "Terjadi kesalahan.");
      throw err;
    }
  };

  const handleVoidOrder = async (order: Order) => {
    const result = await showConfirmDialog(
      "Void Pesanan?",
      `Apakah Anda yakin ingin membatalkan (void) pesanan "${order.orderNumber}"?`,
      "Ya, Void Pesanan!",
    );

    if (result.isConfirmed) {
      const reason = prompt("Masukkan alasan pembatalan/void pesanan:") || "Dibatalkan oleh kasir";
      try {
        await ordersService.voidOrder(order.orderId, { reason });
        showSuccessAlert("Berhasil Dibatalkan", `Pesanan ${order.orderNumber} telah di-void.`);
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Void", err.message || "Gagal membatalkan pesanan.");
      }
    }
  };

  const handleExportCsv = () => {
    if (orders.length === 0) return;
    const headers = ["No Order", "No Faktur", "Waktu", "Tipe", "Pelanggan", "Total", "Status Bayar", "Status Order"];
    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.invoiceNumber || "-"}"`,
      `"${new Date(o.orderedAt).toLocaleString("id-ID")}"`,
      `"${o.orderType}"`,
      `"${o.customer?.customerName || o.guestName || "Walk-in"}"`,
      Number(o.totalAmount),
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `POS_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Riwayat Transaksi Penjualan" category="Operasional Kasir" />

      <OrdersFilter
        search={search}
        outletId={outletId}
        paymentStatus={paymentStatus}
        orderType={orderType}
        startDate={startDate}
        endDate={endDate}
        outletOptions={outletOptions}
        onSearchChange={setSearch}
        onOutletChange={setOutletId}
        onPaymentStatusChange={setPaymentStatus}
        onOrderTypeChange={setOrderType}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setOutletId("");
          setPaymentStatus("");
          setOrderType("");
          setStartDate("");
          setEndDate("");
          setPage(1);
        }}
      />

      <OrdersTable
        data={orders}
        meta={meta}
        loading={loading}
        page={page}
        pageSize={pageSize}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onOpenCreate={() => router.push("/pos")}
        onOpenDetail={handleOpenDetail}
        onOpenPayment={handleOpenDetail}
        onVoidOrder={handleVoidOrder}
        onExportCsv={handleExportCsv}
      />

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        order={selectedOrder}
        paymentMethodOptions={paymentMethodOptions}
        onClose={() => setIsDetailModalOpen(false)}
        onAddPayment={handleAddPayment}
      />
    </div>
  );
}
