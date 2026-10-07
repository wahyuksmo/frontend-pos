"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { CategoriesFilter, CategoriesTable, CategoriesModal } from "@/modules/categories";
import { categoriesService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Category, PaginationMeta, SelectOption } from "@/types";

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [parentOptions, setParentOptions] = useState<SelectOption[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Category | null>(null);

  const loadParentOptions = useCallback(() => {
    categoriesService
      .findAll({ limit: 100, isActive: "Y" })
      .then((res) => {
        const opts = (res.data || []).map((c) => ({
          value: c.categoryId,
          label: `${c.categoryCode} - ${c.categoryName}`,
        }));
        setParentOptions(opts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadParentOptions();
  }, [loadParentOptions]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        parentCategoryId: parentCategoryId || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data kategori.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, parentCategoryId, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Category) => {
    const result = await showConfirmDialog(
      "Hapus Kategori?",
      `Apakah Anda yakin ingin menghapus kategori "${item.categoryName}" (${item.categoryCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await categoriesService.delete(item.categoryId);
        showSuccessAlert("Berhasil Dihapus", "Data kategori berhasil dihapus.");
        fetchData();
        loadParentOptions();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus kategori.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Kategori Produk" category="Master Data POS" />

      <CategoriesFilter
        search={search}
        parentCategoryId={parentCategoryId}
        isActive={isActive}
        parentOptions={parentOptions}
        onSearchChange={setSearch}
        onParentChange={setParentCategoryId}
        onStatusChange={setIsActive}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setParentCategoryId("");
          setIsActive("");
          setPage(1);
        }}
      />

      <CategoriesTable
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

      <CategoriesModal
        isOpen={isModalOpen}
        initialData={selectedItem}
        parentOptions={parentOptions.filter((p) => p.value !== selectedItem?.categoryId)}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
          loadParentOptions();
        }}
      />
    </div>
  );
}
