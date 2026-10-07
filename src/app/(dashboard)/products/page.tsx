"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { ProductsFilter, ProductsTable, ProductsModal } from "@/modules/products";
import { productsService, categoriesService, brandsService, unitsService, taxesService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Product, PaginationMeta, SelectOption } from "@/types";

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [isActive, setIsActive] = useState("");

  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [brandOptions, setBrandOptions] = useState<SelectOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([]);
  const [taxOptions, setTaxOptions] = useState<SelectOption[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);

  const loadDependencies = async () => {
    try {
      const [catRes, brandRes, unitRes, taxRes] = await Promise.all([
        categoriesService.findAll({ limit: 100, isActive: "Y" }),
        brandsService.findAll({ limit: 100, isActive: "Y" }),
        unitsService.findAll({ limit: 100, isActive: "Y" }),
        taxesService.findAll({ limit: 100, isActive: "Y" }),
      ]);
      setCategoryOptions(
        (catRes.data || []).map((c) => ({ value: c.categoryId, label: `${c.categoryName} (${c.categoryCode})` }))
      );
      setBrandOptions(
        (brandRes.data || []).map((b) => ({ value: b.brandId, label: `${b.brandName} (${b.brandCode})` }))
      );
      setUnitOptions(
        (unitRes.data || []).map((u) => ({ value: u.unitId, label: `${u.unitName} (${u.unitCode})` }))
      );
      setTaxOptions(
        (taxRes.data || []).map((t) => ({ value: t.taxId, label: `${t.taxName} (${t.rate}%)` }))
      );
    } catch {
      // ignore
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat katalog produk.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, categoryId, brandId, isActive]);

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Product) => {
    const result = await showConfirmDialog(
      "Hapus Produk?",
      `Apakah Anda yakin ingin menghapus produk "${item.productName}" (${item.productCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await productsService.delete(item.productId);
        showSuccessAlert("Berhasil Dihapus", "Data produk berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus produk.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Katalog Produk" category="Master Data POS" />

      <ProductsFilter
        search={search}
        categoryId={categoryId}
        brandId={brandId}
        isActive={isActive}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        onSearchChange={setSearch}
        onCategoryChange={setCategoryId}
        onBrandChange={setBrandId}
        onStatusChange={setIsActive}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setCategoryId("");
          setBrandId("");
          setIsActive("");
          setPage(1);
        }}
      />

      <ProductsTable
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

      <ProductsModal
        isOpen={isModalOpen}
        initialData={selectedItem}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        unitOptions={unitOptions}
        taxOptions={taxOptions}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
