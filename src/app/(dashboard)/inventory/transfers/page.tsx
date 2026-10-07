"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Boxes, ClipboardCheck, ArrowLeftRight } from "lucide-react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import {
  StockTransferTable,
  StockTransferModal,
} from "@/modules/inventory";
import { inventoryService } from "@/services/inventory.service";
import { showErrorAlert } from "@/lib/sweetalert";
import type { StockTransferItem, PaginationMeta } from "@/types";

export default function StockTransfersPage() {
  const [items, setItems] = useState<StockTransferItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getTransfers({
        page,
        limit: pageSize,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data transfer.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-5">
      <PageTitleBox title="Transfer Stok Antar Gudang" category="Inventori & Cabang" />

      {/* Navigasi Tab Sub-Modul Inventori */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-galaxy-border/80 pb-3">
        <Link
          href="/inventory"
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-galaxy-hover font-heading transition-colors"
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
          className="flex items-center gap-1.5 rounded-lg bg-primary-400/10 px-3.5 py-1.5 text-xs font-semibold text-primary-400 border border-primary-400/30 font-heading"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Transfer Antar Gudang</span>
        </Link>
      </div>

      {/* Tabel Data Transfer */}
      <StockTransferTable
        data={items}
        meta={meta}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onOpenCreate={() => setIsModalOpen(true)}
        onRefresh={fetchData}
      />

      {/* Modal Buat Transfer Baru */}
      <StockTransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
