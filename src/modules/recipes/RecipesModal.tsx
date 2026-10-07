"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Layers, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { recipesService, productsService, unitsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { RecipeGrouped, Product, Unit, BulkSaveRecipeItemPayload } from "@/types";

export interface RecipesModalProps {
  isOpen: boolean;
  initialData?: RecipeGrouped | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormRecipeItem {
  id: string; // temporary client key
  recipeId?: string;
  ingredientProductId: string;
  unitId: string;
  quantity: number;
  wastagePercent: number;
  costPrice: number;
  isActive: "Y" | "N";
}

export function RecipesModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: RecipesModalProps) {
  const isEdit = Boolean(initialData);

  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [isActive, setIsActive] = useState<"Y" | "N">("Y");
  const [items, setItems] = useState<FormRecipeItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        productsService.findAll({ limit: 500, isActive: "Y" }),
        unitsService.findAll({ limit: 200, isActive: "Y" }),
      ]).then(([prodRes, unitRes]) => {
        setProducts(prodRes.data || []);
        setUnits(unitRes.data || []);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProductId(initialData.productId || "");
        setVariantId(initialData.variantId || "");
        setIsActive(initialData.isActive || "Y");

        // Fetch fresh ingredients for this product & variant
        setLoadingDetails(true);
        recipesService
          .findByProduct(initialData.productId, initialData.variantId || undefined)
          .then((res) => {
            const recipeList = res.data || [];
            if (recipeList.length > 0) {
              setItems(
                recipeList.map((r, idx) => ({
                  id: r.recipeId || `row_${idx}`,
                  recipeId: r.recipeId,
                  ingredientProductId: r.ingredientProductId,
                  unitId: r.unitId,
                  quantity: Number(r.quantity) || 1,
                  wastagePercent: Number(r.wastagePercent) || 0,
                  costPrice: Number(r.costPrice) || 0,
                  isActive: (r.isActive as "Y" | "N") || "Y",
                }))
              );
            } else {
              setItems([createNewRow()]);
            }
          })
          .catch(() => {
            // Fallback to initialData.items if API fails
            if (initialData.items && initialData.items.length > 0) {
              setItems(
                initialData.items.map((r, idx) => ({
                  id: r.recipeId || `row_${idx}`,
                  recipeId: r.recipeId,
                  ingredientProductId: r.ingredientProductId,
                  unitId: r.unitId,
                  quantity: Number(r.quantity) || 1,
                  wastagePercent: Number(r.wastagePercent) || 0,
                  costPrice: Number(r.costPrice) || 0,
                  isActive: (r.isActive as "Y" | "N") || "Y",
                }))
              );
            } else {
              setItems([createNewRow()]);
            }
          })
          .finally(() => {
            setLoadingDetails(false);
          });
      } else {
        setProductId("");
        setVariantId("");
        setIsActive("Y");
        setItems([createNewRow()]);
        setLoadingDetails(false);
      }
    }
  }, [initialData, isOpen]);

  const createNewRow = (): FormRecipeItem => ({
    id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    ingredientProductId: "",
    unitId: "",
    quantity: 1,
    wastagePercent: 0,
    costPrice: 0,
    isActive: "Y",
  });

  const handleAddRow = () => {
    setItems((prev) => [...prev, createNewRow()]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) {
      showErrorAlert("Perhatian", "Resep minimal harus memiliki 1 bahan baku.");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof FormRecipeItem,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // Auto-populate unit & costPrice when selecting ingredient
        if (field === "ingredientProductId") {
          const selectedProd = products.find((p) => p.productId === value);
          if (selectedProd) {
            if (selectedProd.unitId && !updated.unitId) {
              updated.unitId = selectedProd.unitId;
            }
            if (Number(selectedProd.costPrice) > 0 && updated.costPrice === 0) {
              updated.costPrice = Number(selectedProd.costPrice);
            }
          }
        }

        return updated;
      })
    );
  };

  const selectedMenuProduct = products.find((p) => p.productId === productId);
  const variantOptions = [
    { value: "", label: "Semua Varian (Berlaku Global)" },
    ...(selectedMenuProduct?.variants?.map((v) => ({
      value: v.variantId,
      label: `${v.variantName} (${v.variantCode})`,
    })) || []),
  ];

  // Candidates for Menu Product (Finished Good)
  const menuProductOptions = products.map((p) => ({
    value: p.productId,
    label: `${p.productName} (${p.productCode})`,
  }));

  // Candidates for Raw Materials (excluding currently selected menu product)
  const ingredientOptions = products
    .filter((p) => p.productId !== productId)
    .map((p) => ({
      value: p.productId,
      label: `${p.productName} (${p.productCode})`,
    }));

  const unitOptions = units.map((u) => ({
    value: u.unitId,
    label: `${u.unitName} (${u.unitCode})`,
  }));

  // Calculate totals
  const totalEstimatedCost = items.reduce((acc, row) => {
    const qty = Number(row.quantity) || 0;
    const cost = Number(row.costPrice) || 0;
    const wastage = 1 + (Number(row.wastagePercent) || 0) / 100;
    return acc + qty * cost * wastage;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      showErrorAlert("Validasi Gagal", "Silakan pilih produk menu jadi.");
      return;
    }

    if (items.length === 0) {
      showErrorAlert("Validasi Gagal", "Minimal harus ada 1 bahan baku dalam resep.");
      return;
    }

    // Check duplicate ingredients
    const ingredientIds = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.ingredientProductId) {
        showErrorAlert("Validasi Gagal", `Bahan baku pada baris ke-${i + 1} belum dipilih.`);
        return;
      }
      if (it.ingredientProductId === productId) {
        showErrorAlert("Validasi Gagal", `Bahan baku baris ke-${i + 1} tidak boleh sama dengan menu jadi.`);
        return;
      }
      if (ingredientIds.has(it.ingredientProductId)) {
        const dup = products.find((p) => p.productId === it.ingredientProductId);
        showErrorAlert(
          "Bahan Duplikat",
          `Bahan baku "${dup?.productName || "ini"}" dipilih lebih dari satu kali. Gabungkan jumlah takarannya dalam satu baris.`
        );
        return;
      }
      ingredientIds.add(it.ingredientProductId);

      if (!it.unitId) {
        showErrorAlert("Validasi Gagal", `Satuan takaran pada baris ke-${i + 1} belum dipilih.`);
        return;
      }
      if (Number(it.quantity) <= 0) {
        showErrorAlert("Validasi Gagal", `Jumlah takaran pada baris ke-${i + 1} harus lebih dari 0.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payloadItems: BulkSaveRecipeItemPayload[] = items.map((it) => ({
        recipeId: it.recipeId,
        ingredientProductId: it.ingredientProductId,
        unitId: it.unitId,
        quantity: Number(it.quantity),
        wastagePercent: Number(it.wastagePercent) || 0,
        costPrice: Number(it.costPrice) || 0,
        isActive: isActive,
      }));

      await recipesService.saveBulk({
        productId,
        variantId: variantId || null,
        items: payloadItems,
      });

      showSuccessAlert(
        "BOM Berhasil Disimpan",
        `Resep & takaran bahan untuk ${selectedMenuProduct?.productName || "menu"} berhasil disimpan.`
      );
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan Resep", err.message || "Terjadi kesalahan saat menyimpan resep.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Resep & BOM (Bill of Materials)" : "Buat Resep Baru (Master-Detail)"}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header Section: Product & Variant */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-galaxy-border/80 dark:bg-galaxy-card/40 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100 font-heading border-b border-slate-200/60 dark:border-galaxy-border/40 pb-2">
            <Layers className="h-4 w-4 text-primary-400" />
            <span>Target Menu & Varian Olahan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Produk Menu Jadi <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect
                options={menuProductOptions}
                value={productId}
                onChange={(val) => {
                  setProductId(val);
                  setVariantId("");
                }}
                disabled={isEdit}
                placeholder="Pilih Menu Jadi..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Varian Spesifik
              </label>
              <SearchableSelect
                options={variantOptions}
                value={variantId}
                onChange={(val) => setVariantId(val)}
                disabled={isEdit}
                placeholder="Semua Varian (Global)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Status Resep
              </label>
              <SearchableSelect
                options={[
                  { value: "Y", label: "Aktif (Auto-Potong Stok)" },
                  { value: "N", label: "Nonaktif" },
                ]}
                value={isActive}
                onChange={(val) => setIsActive(val as "Y" | "N")}
              />
            </div>
          </div>
        </div>

        {/* Detail Items Section: Dynamic Ingredient Rows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
                <span>Rincian Bahan Baku (BOM Items)</span>
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-mono font-bold text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  {items.length} Bahan
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tentukan takaran bahan mentah per porsi yang otomatis dipotong dari gudang/kitchen saat order selesai.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="gap-1.5 text-xs text-primary-600 border-primary-200 hover:bg-primary-50 dark:text-primary-400 dark:border-primary-500/30 dark:hover:bg-primary-950/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Bahan</span>
            </Button>
          </div>

          {loadingDetails ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Memuat komposisi bahan resep...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-galaxy-border/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-galaxy-thead border-b border-slate-200/80 dark:border-galaxy-border/80 text-slate-600 dark:text-slate-300 font-heading">
                  <tr>
                    <th className="w-10 px-3 py-2.5 text-center">No</th>
                    <th className="min-w-[220px] px-3 py-2.5 font-semibold">
                      Bahan Baku <span className="text-rose-500">*</span>
                    </th>
                    <th className="min-w-[140px] px-3 py-2.5 font-semibold">
                      Satuan <span className="text-rose-500">*</span>
                    </th>
                    <th className="w-28 px-3 py-2.5 font-semibold">
                      Takaran <span className="text-rose-500">*</span>
                    </th>
                    <th className="w-24 px-3 py-2.5 font-semibold">Susut (%)</th>
                    <th className="w-28 px-3 py-2.5 font-semibold">HPP Satuan</th>
                    <th className="w-32 px-3 py-2.5 font-semibold text-right">Subtotal HPP</th>
                    <th className="w-12 px-3 py-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40 text-slate-700 dark:text-slate-200">
                  {items.map((row, index) => {
                    const rowQty = Number(row.quantity) || 0;
                    const rowCost = Number(row.costPrice) || 0;
                    const rowWastage = 1 + (Number(row.wastagePercent) || 0) / 100;
                    const rowSubtotal = rowQty * rowCost * rowWastage;

                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-galaxy-hover/20 transition-colors"
                      >
                        <td className="px-3 py-2 text-center font-mono text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2">
                          <SearchableSelect
                            options={ingredientOptions}
                            value={row.ingredientProductId}
                            onChange={(val) =>
                              handleItemChange(row.id, "ingredientProductId", val)
                            }
                            placeholder="Pilih Bahan..."
                          />
                        </td>
                        <td className="px-3 py-2">
                          <SearchableSelect
                            options={unitOptions}
                            value={row.unitId}
                            onChange={(val) =>
                              handleItemChange(row.id, "unitId", val)
                            }
                            placeholder="Satuan..."
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="any"
                            min="0.0001"
                            required
                            value={row.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                row.id,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                            className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs font-mono text-slate-800 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 focus:border-primary-400 focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={row.wastagePercent}
                            onChange={(e) =>
                              handleItemChange(
                                row.id,
                                "wastagePercent",
                                Number(e.target.value)
                              )
                            }
                            className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs font-mono text-slate-800 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 focus:border-primary-400 focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={row.costPrice}
                            onChange={(e) =>
                              handleItemChange(
                                row.id,
                                "costPrice",
                                Number(e.target.value)
                              )
                            }
                            className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs font-mono text-slate-800 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 focus:border-primary-400 focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-medium text-slate-900 dark:text-slate-100">
                          Rp {Math.round(rowSubtotal).toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            disabled={items.length <= 1}
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-rose-500 hover:bg-rose-50 disabled:opacity-30 dark:hover:bg-rose-950/20"
                            title="Hapus Baris"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Summary Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-primary-200/60 bg-primary-50/40 px-4 py-3 dark:border-primary-500/20 dark:bg-primary-950/20">
          <div className="flex items-center gap-2 text-xs text-primary-800 dark:text-primary-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-primary-500" />
            <span>
              Total HPP dihitung otomatis dari (Takaran × HPP Satuan × (1 + Susut%)).
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total Bahan:</span>{" "}
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {items.length} Item
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Estimasi HPP Total:</span>{" "}
              <span className="font-mono font-bold text-primary-600 dark:text-primary-400 text-sm">
                Rp {Math.round(totalEstimatedCost).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-galaxy-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
            className="shadow-galaxy-cyan"
          >
            {isEdit ? "Simpan Perubahan BOM" : "Simpan Resep Lengkap"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
