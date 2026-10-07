"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { UnitsFilter, UnitsTable, UnitsModal } from "@/modules/units";
import { unitsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Unit, PaginationMeta } from "@/types";

export default function UnitsPage() {
  const [items, setItems] = useState<Unit[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Unit | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await unitsService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data satuan.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Unit) => {
    const result = await showConfirmDialog(
      "Hapus Satuan?",
      `Apakah Anda yakin ingin menghapus satuan "${item.unitName}" (${item.unitCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await unitsService.delete(item.unitId);
        showSuccessAlert("Berhasil Dihapus", "Data satuan berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus satuan.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Satuan Barang (UOM)" category="Master Data POS" />

      <UnitsFilter
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

      <UnitsTable
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

      <UnitsModal
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
