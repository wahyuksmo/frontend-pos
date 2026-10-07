"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { KitchenStationsFilter, KitchenStationsTable, KitchenStationsModal } from "@/modules/kitchen-stations";
import { kitchenStationsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { KitchenStation, PaginationMeta } from "@/types";

export default function KitchenStationsPage() {
  const [items, setItems] = useState<KitchenStation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KitchenStation | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kitchenStationsService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data station.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: KitchenStation) => {
    const result = await showConfirmDialog(
      "Hapus Station?",
      `Apakah Anda yakin ingin menghapus kitchen station "${item.stationName}" (${item.stationCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await kitchenStationsService.delete(item.stationId);
        showSuccessAlert("Berhasil Dihapus", "Kitchen station berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus station.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Kitchen Station & Printer" category="Master Data F&B Enterprise" />

      <KitchenStationsFilter
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

      <KitchenStationsTable
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

      <KitchenStationsModal
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
