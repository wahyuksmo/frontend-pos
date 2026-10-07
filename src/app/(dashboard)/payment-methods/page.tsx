"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { PaymentMethodsFilter, PaymentMethodsTable, PaymentMethodsModal } from "@/modules/payment-methods";
import { paymentMethodsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { PaymentMethod, PaginationMeta } from "@/types";

export default function PaymentMethodsPage() {
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [methodType, setMethodType] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PaymentMethod | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentMethodsService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        methodType: methodType || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat metode pembayaran.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, methodType, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: PaymentMethod) => {
    const result = await showConfirmDialog(
      "Hapus Metode Pembayaran?",
      `Apakah Anda yakin ingin menghapus metode "${item.methodName}" (${item.methodCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await paymentMethodsService.delete(item.paymentMethodId);
        showSuccessAlert("Berhasil Dihapus", "Metode pembayaran berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus metode pembayaran.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Metode Pembayaran" category="Master Data POS" />

      <PaymentMethodsFilter
        search={search}
        methodType={methodType}
        isActive={isActive}
        onSearchChange={setSearch}
        onTypeChange={setMethodType}
        onStatusChange={setIsActive}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setMethodType("");
          setIsActive("");
          setPage(1);
        }}
      />

      <PaymentMethodsTable
        data={items}
        meta={meta}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onOpenCreate={() => {
          setSelectedItem(null);
          setIsModalOpen(true);
        }}
        onOpenEdit={(item) => {
          setSelectedItem(item);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <PaymentMethodsModal
        isOpen={isModalOpen}
        initialData={selectedItem}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
