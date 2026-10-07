"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { DiscountsFilter, DiscountsTable, DiscountsModal } from "@/modules/discounts";
import { discountsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Discount, PaginationMeta } from "@/types";

export default function DiscountsPage() {
  const [items, setItems] = useState<Discount[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Discount | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await discountsService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        discountType: discountType || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data diskon.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, discountType, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Discount) => {
    const result = await showConfirmDialog(
      "Hapus Diskon?",
      `Apakah Anda yakin ingin menghapus promosi "${item.discountName}" (${item.discountCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await discountsService.delete(item.discountId);
        showSuccessAlert("Berhasil Dihapus", "Promosi diskon berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus promosi diskon.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Diskon & Promosi" category="Master Data POS" />

      <DiscountsFilter
        search={search}
        discountType={discountType}
        isActive={isActive}
        onSearchChange={setSearch}
        onTypeChange={setDiscountType}
        onStatusChange={setIsActive}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setDiscountType("");
          setIsActive("");
          setPage(1);
        }}
      />

      <DiscountsTable
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

      <DiscountsModal
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
