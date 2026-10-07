"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { DiningTablesFilter, DiningTablesTable, DiningTablesModal } from "@/modules/dining-tables";
import { diningTablesService, outletsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { DiningTable, PaginationMeta, SelectOption } from "@/types";

export default function DiningTablesPage() {
  const [items, setItems] = useState<DiningTable[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [outletOptions, setOutletOptions] = useState<SelectOption[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [outletId, setOutletId] = useState("");
  const [status, setStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DiningTable | null>(null);

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
      const res = await diningTablesService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        outletId: outletId || undefined,
        status: status || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data meja.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, outletId, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: DiningTable) => {
    const result = await showConfirmDialog(
      "Hapus Meja?",
      `Apakah Anda yakin ingin menghapus meja "${item.tableName}" (${item.tableCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await diningTablesService.delete(item.tableId);
        showSuccessAlert("Berhasil Dihapus", "Data meja berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus meja.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Meja Resto & Dine-In" category="Master Data POS" />

      <DiningTablesFilter
        search={search}
        outletId={outletId}
        status={status}
        outletOptions={outletOptions}
        onSearchChange={setSearch}
        onOutletChange={setOutletId}
        onStatusChange={setStatus}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setOutletId("");
          setStatus("");
          setPage(1);
        }}
      />

      <DiningTablesTable
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

      <DiningTablesModal
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
