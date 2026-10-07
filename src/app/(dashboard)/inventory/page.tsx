"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Boxes, ClipboardCheck, ArrowLeftRight } from "lucide-react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import {
  InventoryStockFilter,
  InventoryStockTable,
  StockMovementModal,
} from "@/modules/inventory";
import { inventoryService } from "@/services/inventory.service";
import { warehousesService } from "@/services";
import { showErrorAlert } from "@/lib/sweetalert";
import type { StockItem, PaginationMeta, SelectOption } from "@/types";

export default function InventoryStocksPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [isLowStock, setIsLowStock] = useState("");
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOption[]>([]);

  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  useEffect(() => {
    warehousesService.findAll({ limit: 100, isActive: "Y" }).then((res) => {
      setWarehouseOptions(
        (res.data || []).map((w) => ({ value: w.warehouseId, label: w.warehouseName }))
      );
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getStocks({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        warehouseId: warehouseId || undefined,
        isLowStock: isLowStock || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat saldo stok.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, warehouseId, isLowStock]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCsv = () => {
    if (items.length === 0) return;
    const headers = ["Gudang", "Kode Produk", "Nama Produk", "SKU", "Satuan", "Saldo Stok", "Min Stok", "Max Stok"];
    const rows = items.map((i) => [
      `"${i.warehouse.warehouseName}"`,
      `"${i.product.productCode}"`,
      `"${i.product.productName}"`,
      `"${i.product.sku || ""}"`,
      `"${i.product.unit?.unitName || ""}"`,
      i.quantity,
      i.minStock,
      i.maxStock,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `saldo_stok_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Judul */}
      <PageTitleBox title="Saldo & Kartu Stok Barang" category="Inventori & Cabang" />

      {/* Navigasi Tab Sub-Modul Inventori */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-galaxy-border/80 pb-3">
        <Link
          href="/inventory"
          className="flex items-center gap-1.5 rounded-lg bg-primary-400/10 px-3.5 py-1.5 text-xs font-semibold text-primary-400 border border-primary-400/30 font-heading"
        >
          <Boxes className="h-4 w-4" />
          <span>Saldo Stok</span>
        </Link>
        <Link
          href="/inventory/adjustments"
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-galaxy-hover font-heading transition-colors"
        >
          <ClipboardCheck className="h-4 w-4" />
          <span>Penyesuaian & Opname</span>
        </Link>
        <Link
          href="/inventory/transfers"
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-galaxy-hover font-heading transition-colors"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Transfer Antar Gudang</span>
        </Link>
      </div>

      {/* 2. Kartu Filter */}
      <InventoryStockFilter
        search={search}
        warehouseId={warehouseId}
        isLowStock={isLowStock}
        warehouseOptions={warehouseOptions}
        onSearchChange={setSearch}
        onWarehouseChange={setWarehouseId}
        onLowStockChange={setIsLowStock}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setWarehouseId("");
          setIsLowStock("");
          setPage(1);
        }}
      />

      {/* 3. Kartu Tabel Saldo Stok */}
      <InventoryStockTable
        data={items}
        meta={meta}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onViewMovement={(stock) => {
          setSelectedStock(stock);
          setIsMovementModalOpen(true);
        }}
        onExportCsv={handleExportCsv}
      />

      {/* 4. Modal Kartu Stok Mutasi */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        stockItem={selectedStock}
        onClose={() => {
          setIsMovementModalOpen(false);
          setSelectedStock(null);
        }}
      />
    </div>
  );
}
