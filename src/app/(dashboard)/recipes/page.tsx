"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { RecipesFilter, RecipesTable, RecipesModal } from "@/modules/recipes";
import { recipesService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { RecipeGrouped, PaginationMeta } from "@/types";

export default function RecipesPage() {
  const [items, setItems] = useState<RecipeGrouped[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecipeGrouped | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recipesService.findGrouped({
        page,
        limit: pageSize,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat resep.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: RecipeGrouped) => {
    const productName = item.product?.productName || "Menu";
    const variantLabel = item.variant ? ` (${item.variant.variantName})` : "";
    const result = await showConfirmDialog(
      "Hapus Resep & BOM?",
      `Hapus seluruh komposisi bahan (${item.totalItems} bahan baku) untuk menu ${productName}${variantLabel}?`,
      "Ya, Hapus Resep!"
    );

    if (result.isConfirmed) {
      try {
        await recipesService.deleteByProduct(item.productId, item.variantId || undefined);
        showSuccessAlert("Berhasil Dihapus", `Seluruh bahan resep untuk ${productName} berhasil dihapus.`);
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus resep.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Resep & BOM Menu Olahan" category="Master Data F&B Enterprise" />

      <RecipesFilter
        isActive={isActive}
        onStatusChange={setIsActive}
        onFilter={() => setPage(1)}
        onReset={() => {
          setIsActive("");
          setPage(1);
        }}
      />

      <RecipesTable
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

      <RecipesModal
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
