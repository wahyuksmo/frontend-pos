"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { BrandsFilter, BrandsTable, BrandsModal } from "@/modules/brands";
import { brandsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Brand, PaginationMeta } from "@/types";

export default function BrandsPage() {
  const [items, setItems] = useState<Brand[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Brand | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await brandsService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data merek.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Brand) => {
    const result = await showConfirmDialog(
      "Hapus Merek?",
      `Apakah Anda yakin ingin menghapus merek "${item.brandName}" (${item.brandCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await brandsService.delete(item.brandId);
        showSuccessAlert("Berhasil Dihapus", "Data merek berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus merek.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Merek Produk (Brand)" category="Master Data POS" />

      <BrandsFilter
        search={search}
        isActive={isActive}
        onSearchChange={setSearch}
        onStatusChange={setIsActive}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setIsActive("");
          setPage(1);
        }}
      />

      <BrandsTable
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

      <BrandsModal
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
