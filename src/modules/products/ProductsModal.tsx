"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { productsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import { Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/forms/ImageUpload";
import type { Product, SelectOption, ProductVariant } from "@/types";

export interface ProductsModalProps {
  isOpen: boolean;
  initialData?: Product | null;
  categoryOptions: SelectOption[];
  brandOptions: SelectOption[];
  unitOptions: SelectOption[];
  taxOptions: SelectOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductsModal({
  isOpen,
  initialData,
  categoryOptions,
  brandOptions,
  unitOptions,
  taxOptions,
  onClose,
  onSuccess,
}: ProductsModalProps) {
  const isEdit = Boolean(initialData);
  const [activeTab, setActiveTab] = useState<"info" | "price" | "variants">("info");

  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    barcode: "",
    sku: "",
    productType: "STANDARD",
    categoryId: "",
    brandId: "",
    unitId: "",
    taxId: "",
    costPrice: 0,
    sellingPrice: 0,
    minStock: 0,
    maxStock: 0,
    isInventoryTracked: "Y",
    isForSale: "Y",
    imageUrl: "",
    description: "",
    isActive: "Y",
  });

  const [variants, setVariants] = useState<
    Array<{ variantCode: string; variantName: string; sellingPrice: number; costPrice: number }>
  >([]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        productCode: initialData.productCode || "",
        productName: initialData.productName || "",
        barcode: initialData.barcode || "",
        sku: initialData.sku || "",
        productType: initialData.productType || "STANDARD",
        categoryId: initialData.categoryId || "",
        brandId: initialData.brandId || "",
        unitId: initialData.unitId || "",
        taxId: initialData.taxId || "",
        costPrice: Number(initialData.costPrice) || 0,
        sellingPrice: Number(initialData.sellingPrice) || 0,
        minStock: Number(initialData.minStock) || 0,
        maxStock: Number(initialData.maxStock) || 0,
        isInventoryTracked: initialData.isInventoryTracked || "Y",
        isForSale: initialData.isForSale || "Y",
        imageUrl: initialData.imageUrl || "",
        description: initialData.description || "",
        isActive: initialData.isActive || "Y",
      });

      // Load existing variants if any
      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(
          initialData.variants.map((v) => ({
            variantCode: v.variantCode,
            variantName: v.variantName,
            sellingPrice: Number(v.sellingPrice) || 0,
            costPrice: Number(v.costPrice) || 0,
          }))
        );
      } else {
        setVariants([]);
      }
    } else {
      setFormData({
        productCode: "",
        productName: "",
        barcode: "",
        sku: "",
        productType: "STANDARD",
        categoryId: "",
        brandId: "",
        unitId: "",
        taxId: "",
        costPrice: 0,
        sellingPrice: 0,
        minStock: 0,
        maxStock: 0,
        isInventoryTracked: "Y",
        isForSale: "Y",
        imageUrl: "",
        description: "",
        isActive: "Y",
      });
      setVariants([]);
    }
    setActiveTab("info");
  }, [initialData, isOpen]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        variantCode: `${formData.productCode || "VAR"}-${variants.length + 1}`,
        variantName: "",
        sellingPrice: formData.sellingPrice,
        costPrice: formData.costPrice,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productCode.trim() || !formData.productName.trim()) {
      showErrorAlert("Validasi Gagal", "Kode dan Nama Produk wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        ...formData,
        categoryId: formData.categoryId || undefined,
        brandId: formData.brandId || undefined,
        unitId: formData.unitId || undefined,
        taxId: formData.taxId || undefined,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        minStock: Number(formData.minStock),
        maxStock: Number(formData.maxStock),
      };

      if (!isEdit && variants.length > 0) {
        payload.variants = variants;
        payload.productType = "VARIANT";
      }

      if (isEdit && initialData) {
        await productsService.update(initialData.productId, payload);
        showSuccessAlert("Berhasil Diperbarui", "Data produk berhasil disimpan.");
      } else {
        await productsService.create(payload);
        showSuccessAlert("Berhasil Dibuat", "Produk baru berhasil ditambahkan.");
      }
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan Data", err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const productTypeOptions = [
    { value: "STANDARD", label: "Produk Standar (Retail)" },
    { value: "VARIANT", label: "Produk Bervarian (Ukuran/Warna/Rasa)" },
    { value: "COMBO", label: "Paket Combo / Bundling" },
    { value: "SERVICE", label: "Jasa / Layanan" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Katalog Produk" : "Tambah Produk Baru"}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-galaxy-border text-xs font-heading">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "info"
                ? "border-primary-400 text-primary-400 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Informasi Umum
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("price")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "price"
                ? "border-primary-400 text-primary-400 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Harga & Persediaan
          </button>
          {!isEdit && (
            <button
              type="button"
              onClick={() => setActiveTab("variants")}
              className={`px-4 py-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "variants"
                  ? "border-primary-400 text-primary-400 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span>Varian Produk</span>
              {variants.length > 0 && (
                <span className="h-4 w-4 rounded-full bg-primary-400/20 text-primary-400 text-[10px] flex items-center justify-center font-mono">
                  {variants.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tab 1: Info Umum */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Upload Foto & Preview */}
            <div className="sm:col-span-2">
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                label="Foto / Gambar Produk"
                helperText="Upload gambar produk untuk POS kasir (JPG, PNG, WEBP, GIF, Maks. 5MB)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Kode Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PRD-001"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value.toUpperCase() })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kopi Susu Gula Aren"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Barcode / EAN-13
              </label>
              <input
                type="text"
                placeholder="Contoh: 899123456789"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                placeholder="Contoh: SKU-KPS-01"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Tipe Produk
              </label>
              <SearchableSelect
                size="sm"
                options={productTypeOptions}
                value={formData.productType}
                onChange={(val) => setFormData({ ...formData, productType: val })}
                placeholder="Pilih Tipe..."
                clearable={false}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Kategori Produk
              </label>
              <SearchableSelect
                size="sm"
                options={[{ value: "", label: "Tanpa Kategori" }, ...categoryOptions]}
                value={formData.categoryId}
                onChange={(val) => setFormData({ ...formData, categoryId: val })}
                placeholder="Pilih Kategori..."
                clearable={true}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Merek / Brand
              </label>
              <SearchableSelect
                size="sm"
                options={[{ value: "", label: "Tanpa Merek" }, ...brandOptions]}
                value={formData.brandId}
                onChange={(val) => setFormData({ ...formData, brandId: val })}
                placeholder="Pilih Merek..."
                clearable={true}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Satuan Ukuran (UOM)
              </label>
              <SearchableSelect
                size="sm"
                options={[{ value: "", label: "Pilih Satuan" }, ...unitOptions]}
                value={formData.unitId}
                onChange={(val) => setFormData({ ...formData, unitId: val })}
                placeholder="Pilih Satuan..."
                clearable={true}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Deskripsi Produk
              </label>
              <textarea
                rows={2}
                placeholder="Keterangan bahan, komposisi, atau catatan jual..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Status Aktif
              </label>
              <select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              >
                <option value="Y">Aktif Dijual</option>
                <option value="N">Nonaktif</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 2: Harga & Persediaan */}
        {activeTab === "price" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Harga Pokok Modal (HPP)
              </label>
              <input
                type="number"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Harga Jual Standar <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Pajak Terkait
              </label>
              <SearchableSelect
                size="sm"
                options={[{ value: "", label: "Tanpa Pajak" }, ...taxOptions]}
                value={formData.taxId}
                onChange={(val) => setFormData({ ...formData, taxId: val })}
                placeholder="Pilih Pajak..."
                clearable={true}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Lacak Persediaan Stok
              </label>
              <select
                value={formData.isInventoryTracked}
                onChange={(e) => setFormData({ ...formData, isInventoryTracked: e.target.value })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              >
                <option value="Y">Ya (Inventori Dihitung)</option>
                <option value="N">Tidak (Menu Olahan/Jasa)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Stok Minimum (Alert Re-order)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Stok Maksimum Kapasitas
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Varian Produk (saat tambah produk baru) */}
        {activeTab === "variants" && !isEdit && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Tambahkan pilihan varian ukuran, warna, atau rasa yang memiliki harga tersendiri.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
                className="gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Varian</span>
              </Button>
            </div>

            {variants.length === 0 ? (
              <div className="p-6 text-center border border-dashed rounded-lg border-slate-200 dark:border-galaxy-border text-slate-400 text-xs">
                Belum ada varian. Klik tombol di atas untuk menambah varian.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-galaxy-border bg-slate-50/50 dark:bg-galaxy-input/40"
                  >
                    <input
                      type="text"
                      placeholder="Kode Varian"
                      value={v.variantCode}
                      onChange={(e) => handleVariantChange(i, "variantCode", e.target.value)}
                      className="h-8 w-28 rounded border border-slate-300 bg-white px-2 text-xs font-mono dark:border-galaxy-border dark:bg-galaxy-card"
                    />
                    <input
                      type="text"
                      placeholder="Nama Varian (mis: Large, Dingin)"
                      value={v.variantName}
                      onChange={(e) => handleVariantChange(i, "variantName", e.target.value)}
                      className="h-8 flex-1 rounded border border-slate-300 bg-white px-2 text-xs dark:border-galaxy-border dark:bg-galaxy-card"
                    />
                    <input
                      type="number"
                      placeholder="Harga Jual"
                      value={v.sellingPrice}
                      onChange={(e) => handleVariantChange(i, "sellingPrice", Number(e.target.value))}
                      className="h-8 w-28 rounded border border-slate-300 bg-white px-2 text-xs font-mono dark:border-galaxy-border dark:bg-galaxy-card"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(i)}
                      className="p-1.5 rounded hover:bg-rose-50 text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200/80 dark:border-galaxy-border/80">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting}
            className="shadow-galaxy-cyan"
          >
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Produk"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
