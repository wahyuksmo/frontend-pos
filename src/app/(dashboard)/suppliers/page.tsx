"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { SuppliersFilter, SuppliersTable, SuppliersModal } from "@/modules/suppliers";
import { suppliersService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Supplier, PaginationMeta } from "@/types";

export default function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Supplier | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await suppliersService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data supplier.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Supplier) => {
    const result = await showConfirmDialog(
      "Hapus Supplier?",
      `Apakah Anda yakin ingin menghapus supplier "${item.supplierName}" (${item.supplierCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await suppliersService.delete(item.supplierId);
        showSuccessAlert("Berhasil Dihapus", "Data supplier berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus supplier.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Data Supplier" category="Master Data POS" />

      <SuppliersFilter
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

      <SuppliersTable
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

      <SuppliersModal
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
