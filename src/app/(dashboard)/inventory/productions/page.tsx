"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import {
  ProductionFilter,
  ProductionTable,
  ProductionCreateModal,
  ProductionDetailModal,
} from "@/modules/inventory";
import { productionsService } from "@/services";
import { showErrorAlert } from "@/lib/sweetalert";
import type { Production, PaginationMeta } from "@/types";

export default function ProductionsPage() {
  const [items, setItems] = useState<Production[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productionsService.findAll({
        page,
        limit: pageSize,
        search: search || undefined,
        warehouseId: warehouseId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat riwayat produksi.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, warehouseId, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetFilter = () => {
    setSearch("");
    setWarehouseId("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <PageTitleBox
        title="Produksi Olahan & Work Order"
        category="Manajemen Inventori & Stok"
      />

      <ProductionFilter
        search={search}
        warehouseId={warehouseId}
        startDate={startDate}
        endDate={endDate}
        onSearchChange={setSearch}
        onWarehouseChange={setWarehouseId}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilter={() => setPage(1)}
        onReset={handleResetFilter}
      />

      <ProductionTable
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
        onOpenCreate={() => setIsCreateOpen(true)}
        onViewDetail={(item) => {
          setSelectedProduction(item);
          setIsDetailOpen(true);
        }}
      />

      <ProductionCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchData();
        }}
      />

      <ProductionDetailModal
        isOpen={isDetailOpen}
        production={selectedProduction}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProduction(null);
        }}
      />
    </div>
  );
}
