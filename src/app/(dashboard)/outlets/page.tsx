"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { OutletsFilter, OutletsTable, OutletsModal } from "@/modules/outlets";
import { outletsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Outlet, PaginationMeta } from "@/types";

export default function OutletsPage() {
  const [items, setItems] = useState<Outlet[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Outlet | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await outletsService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data outlet.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Outlet) => {
    const result = await showConfirmDialog(
      "Hapus Outlet?",
      `Apakah Anda yakin ingin menghapus outlet "${item.outletName}" (${item.outletCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await outletsService.delete(item.outletId);
        showSuccessAlert("Berhasil Dihapus", "Data outlet berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus outlet.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Master Outlet" category="Master Data POS" />

      <OutletsFilter
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

      <OutletsTable
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

      <OutletsModal
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
