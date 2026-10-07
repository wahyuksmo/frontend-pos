"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { WarehousesFilter, WarehousesTable, WarehousesModal } from "@/modules/warehouses";
import { warehousesService, outletsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Warehouse, PaginationMeta, SelectOption } from "@/types";

export default function WarehousesPage() {
  const [items, setItems] = useState<Warehouse[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [outletOptions, setOutletOptions] = useState<SelectOption[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [outletId, setOutletId] = useState("");
  const [warehouseType, setWarehouseType] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Warehouse | null>(null);

  useEffect(() => {
    outletsService
      .findAll({ limit: 100, isActive: "Y" })
      .then((res) => {
        const opts = (res.data || []).map((o) => ({
          value: o.outletId,
          label: `${o.outletCode} - ${o.outletName}`,
        }));
        setOutletOptions(opts);
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehousesService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        outletId: outletId || undefined,
        warehouseType: warehouseType || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data gudang.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, outletId, warehouseType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Warehouse) => {
    const result = await showConfirmDialog(
      "Hapus Gudang?",
      `Apakah Anda yakin ingin menghapus gudang "${item.warehouseName}" (${item.warehouseCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await warehousesService.delete(item.warehouseId);
        showSuccessAlert("Berhasil Dihapus", "Data gudang berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus gudang.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Master Gudang" category="Master Data POS" />

      <WarehousesFilter
        search={search}
        outletId={outletId}
        warehouseType={warehouseType}
        outletOptions={outletOptions}
        onSearchChange={setSearch}
        onOutletChange={setOutletId}
        onTypeChange={setWarehouseType}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setOutletId("");
          setWarehouseType("");
          setPage(1);
        }}
      />

      <WarehousesTable
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

      <WarehousesModal
        isOpen={isModalOpen}
        initialData={selectedItem}
        outletOptions={outletOptions}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
