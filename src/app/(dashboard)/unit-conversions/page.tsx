"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { UnitConversionsFilter, UnitConversionsTable, UnitConversionsModal } from "@/modules/unit-conversions";
import { unitConversionsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { UnitConversion, PaginationMeta } from "@/types";

export default function UnitConversionsPage() {
  const [items, setItems] = useState<UnitConversion[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UnitConversion | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await unitConversionsService.findAll({
        page,
        limit: pageSize,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat konversi satuan.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: UnitConversion) => {
    const result = await showConfirmDialog(
      "Hapus Konversi Satuan?",
      `Hapus aturan konversi dari ${item.fromUnit?.unitName || item.fromUnitId} ke ${item.toUnit?.unitName || item.toUnitId}?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await unitConversionsService.delete(item.conversionId);
        showSuccessAlert("Berhasil Dihapus", "Aturan konversi berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus konversi.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Konversi Satuan (Multi-UOM)" category="Master Data F&B Enterprise" />

      <UnitConversionsFilter
        isActive={isActive}
        onStatusChange={setIsActive}
        onFilter={() => setPage(1)}
        onReset={() => {
          setIsActive("");
          setPage(1);
        }}
      />

      <UnitConversionsTable
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

      <UnitConversionsModal
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
