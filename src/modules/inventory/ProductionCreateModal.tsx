"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Cpu, AlertCircle, Sparkles, PackageCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { productionsService, warehousesService, productsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { SelectOption, Product } from "@/types";

export interface ProductionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MaterialRow {
  productId: string;
  productCode: string;
  productName: string;
  variantId?: string | null;
  unitId?: string | null;
  unitCode: string;
  bomQuantity: number;
  actualQuantity: number;
  costPrice: number;
  notes: string;
}

export function ProductionCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: ProductionCreateModalProps) {
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [targetQuantity, setTargetQuantity] = useState<number>(1);
  const [actualQuantity, setActualQuantity] = useState<number>(1);
  const [productionDate, setProductionDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [loadingBom, setLoadingBom] = useState(false);
  const [noBomAlert, setNoBomAlert] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      warehousesService.findAll({ limit: 100, isActive: "Y" }).then((res) => {
        const whs = res.data || [];
        setWarehouseOptions(
          whs.map((w) => ({ value: w.warehouseId, label: `${w.warehouseName} (${w.warehouseCode})` }))
        );
        if (whs.length > 0 && !warehouseId) {
          const defaultWh = whs.find((w) => w.isDefault === "Y") || whs[0];
          setWarehouseId(defaultWh.warehouseId);
        }
      });

      productsService.findAll({ limit: 500, isActive: "Y" }).then((res) => {
        setProducts(res.data || []);
      });
    }
  }, [isOpen]);

  // When productId, variantId, or targetQuantity changes, calculate from BOM
  useEffect(() => {
    if (!isOpen || !productId) {
      setMaterials([]);
      setNoBomAlert(false);
      return;
    }

    setLoadingBom(true);
    setNoBomAlert(false);
    productionsService
      .calculateFromBom(productId, Number(targetQuantity) || 1, variantId || undefined)
      .then((res) => {
        const bomMats = res.data?.materials || [];
        if (bomMats.length === 0) {
          setNoBomAlert(true);
          setMaterials([]);
        } else {
          setMaterials(
            bomMats.map((m) => ({
              productId: m.productId,
              productCode: m.productCode,
              productName: m.productName,
              variantId: m.variantId || null,
              unitId: m.unitId || null,
              unitCode: m.unitCode || "",
              bomQuantity: m.bomQuantity,
              actualQuantity: m.actualQuantity,
              costPrice: m.costPrice,
              notes: "",
            }))
          );
        }
      })
      .catch(() => {
        setNoBomAlert(true);
        setMaterials([]);
      })
      .finally(() => {
        setLoadingBom(false);
      });
  }, [productId, variantId, targetQuantity, isOpen]);

  if (!isOpen) return null;

  const selectedMenuProduct = products.find((p) => p.productId === productId);
  const variantOptions: SelectOption[] = [
    { value: "", label: "Semua Varian (Resep Global)" },
    ...(selectedMenuProduct?.variants?.map((v) => ({
      value: v.variantId,
      label: `${v.variantName} (${v.variantCode})`,
    })) || []),
  ];

  const menuProductOptions: SelectOption[] = products.map((p) => ({
    value: p.productId,
    label: `${p.productName} (${p.productCode})`,
  }));

  const rawMaterialOptions: SelectOption[] = products
    .filter((p) => p.productId !== productId)
    .map((p) => ({
      value: p.productId,
      label: `${p.productName} (${p.productCode})`,
    }));

  const handleAddMaterial = () => {
    setMaterials((prev) => [
      ...prev,
      {
        productId: "",
        productCode: "",
        productName: "",
        unitCode: "",
        bomQuantity: 0,
        actualQuantity: 1,
        costPrice: 0,
        notes: "Bahan tambahan",
      },
    ]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMaterialChange = (index: number, field: keyof MaterialRow, val: any) => {
    setMaterials((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], [field]: val };

      if (field === "productId") {
        const prod = products.find((p) => p.productId === val);
        if (prod) {
          row.productCode = prod.productCode;
          row.productName = prod.productName;
          row.unitId = prod.unitId || null;
          row.unitCode = prod.unit?.unitCode || "";
          row.costPrice = Number(prod.costPrice) || 0;
        }
      }

      copy[index] = row;
      return copy;
    });
  };

  const totalMaterialCost = materials.reduce((acc, row) => {
    const qty = Number(row.actualQuantity) || 0;
    const cost = Number(row.costPrice) || 0;
    return acc + qty * cost;
  }, 0);

  const costPerUnit = Number(actualQuantity) > 0 ? totalMaterialCost / Number(actualQuantity) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warehouseId) {
      showErrorAlert("Validasi Gagal", "Gudang/dapur produksi wajib dipilih.");
      return;
    }
    if (!productId) {
      showErrorAlert("Validasi Gagal", "Produk menu hasil jadi wajib dipilih.");
      return;
    }
    if (Number(targetQuantity) <= 0 || Number(actualQuantity) <= 0) {
      showErrorAlert("Validasi Gagal", "Target Qty dan Qty Aktual Jadi harus lebih dari 0.");
      return;
    }

    const validMaterials = materials.filter((m) => m.productId);
    if (validMaterials.length === 0) {
      showErrorAlert("Validasi Gagal", "Minimal harus ada 1 bahan baku yang dikonsumsi.");
      return;
    }

    setSubmitting(true);
    try {
      await productionsService.create({
        warehouseId,
        productId,
        variantId: variantId || null,
        targetQuantity: Number(targetQuantity),
        actualQuantity: Number(actualQuantity),
        productionDate: productionDate ? new Date(productionDate).toISOString() : undefined,
        notes: notes || undefined,
        materials: validMaterials.map((m) => ({
          productId: m.productId,
          variantId: m.variantId || null,
          unitId: m.unitId || null,
          bomQuantity: Number(m.bomQuantity || m.actualQuantity),
          actualQuantity: Number(m.actualQuantity),
          costPrice: Number(m.costPrice) || 0,
          notes: m.notes || undefined,
        })),
      });

      showSuccessAlert(
        "Produksi Selesai!",
        `Berhasil memproduksi ${actualQuantity} ${selectedMenuProduct?.unit?.unitCode || "porsi"} ${selectedMenuProduct?.productName}. Stok bahan baku telah dipotong dan stok barang jadi telah bertambah.`
      );
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Eksekusi Produksi", err.message || "Terjadi kesalahan saat memproses produksi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-galaxy-border dark:bg-galaxy-card my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-galaxy-border/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-heading">
                Buat & Selesaikan Produksi Olahan (Work Order)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Eksekusi BOM resep: potong bahan baku dari stok dan tambahkan produk hasil jadi secara atomik.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-galaxy-hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Production Header */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-galaxy-border/80 dark:bg-galaxy-card/40 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                  Gudang / Kitchen Produksi <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={warehouseOptions}
                  value={warehouseId}
                  onChange={setWarehouseId}
                  placeholder="Pilih Gudang / Dapur..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                  Tanggal Produksi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                  Produk Menu Jadi yang Diproduksi <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={menuProductOptions}
                  value={productId}
                  onChange={(val) => {
                    setProductId(val);
                    setVariantId("");
                  }}
                  placeholder="Pilih Menu Olahan / Finished Good..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                  Varian Menu
                </label>
                <SearchableSelect
                  options={variantOptions}
                  value={variantId}
                  onChange={setVariantId}
                  placeholder="Semua Varian (Resep Global)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                  Target Jumlah Porsi/Qty <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.0001"
                  required
                  value={targetQuantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTargetQuantity(val);
                    setActualQuantity(val);
                  }}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-mono font-bold text-slate-800 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                  Hasil Jadi Aktual (Qty Masuk Stok) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.0001"
                  required
                  value={actualQuantity}
                  onChange={(e) => setActualQuantity(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-emerald-300 bg-emerald-50/30 px-3 text-xs font-mono font-bold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/20 dark:text-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                  Catatan / Batch No
                </label>
                <input
                  type="text"
                  placeholder="Misal: Batch Masak Pagi"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* BOM Material Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span>Konsumsi Bahan Baku (Dihitung dari BOM & Target Qty)</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {materials.length} Bahan
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Qty aktual terisi otomatis sesuai BOM. Anda dapat mengubah jumlah aktual jika ada pemakaian lebih/kurang di dapur.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMaterial}
                className="gap-1.5 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-950/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Bahan Ekstra</span>
              </Button>
            </div>

            {noBomAlert && (
              <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  Menu ini belum memiliki formula BOM resep. Anda dapat menambahkan bahan secara manual dengan tombol <strong>Tambah Bahan Ekstra</strong> di atas, atau atur resep di halaman <strong>Manajemen Resep & BOM</strong>.
                </span>
              </div>
            )}

            {loadingBom ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Menghitung kebutuhan bahan dari formula BOM...
              </div>
            ) : materials.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-xs text-slate-400 dark:border-galaxy-border/80">
                Pilih menu jadi untuk menarik kebutuhan bahan baku secara otomatis.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-galaxy-border/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-galaxy-thead border-b border-slate-200/80 dark:border-galaxy-border/80 text-slate-600 dark:text-slate-300 font-heading">
                    <tr>
                      <th className="w-8 px-3 py-2.5 text-center">No</th>
                      <th className="min-w-[220px] px-3 py-2.5 font-semibold">Bahan Baku</th>
                      <th className="w-28 px-3 py-2.5 font-semibold">Takaran BOM</th>
                      <th className="w-32 px-3 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        Qty Aktual Dipakai <span className="text-rose-500">*</span>
                      </th>
                      <th className="w-28 px-3 py-2.5 font-semibold">HPP Satuan</th>
                      <th className="w-32 px-3 py-2.5 font-semibold text-right">Subtotal Biaya</th>
                      <th className="w-12 px-3 py-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40 text-slate-700 dark:text-slate-200">
                    {materials.map((row, index) => {
                      const rowQty = Number(row.actualQuantity) || 0;
                      const rowCost = Number(row.costPrice) || 0;
                      const subtotal = rowQty * rowCost;

                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-50/50 dark:hover:bg-galaxy-hover/20 transition-colors"
                        >
                          <td className="px-3 py-2 text-center font-mono text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2">
                            {row.bomQuantity > 0 ? (
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                  {row.productName}
                                </div>
                                <div className="font-mono text-[10px] text-slate-400">
                                  {row.productCode}
                                </div>
                              </div>
                            ) : (
                              <SearchableSelect
                                options={rawMaterialOptions}
                                value={row.productId}
                                onChange={(val) =>
                                  handleMaterialChange(index, "productId", val)
                                }
                                placeholder="Pilih Bahan Baku..."
                              />
                            )}
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-500">
                            {row.bomQuantity > 0 ? (
                              <span>
                                {row.bomQuantity} {row.unitCode}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Manual</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="any"
                                min="0.0001"
                                required
                                value={row.actualQuantity}
                                onChange={(e) =>
                                  handleMaterialChange(
                                    index,
                                    "actualQuantity",
                                    Number(e.target.value)
                                  )
                                }
                                className="h-8 w-24 rounded border border-emerald-300 bg-white px-2 text-xs font-mono font-bold text-slate-800 dark:border-emerald-500/40 dark:bg-galaxy-input dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                              />
                              <span className="text-[11px] font-mono text-slate-400">
                                {row.unitCode}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-300">
                            Rp {Math.round(rowCost).toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                            Rp {Math.round(subtotal).toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(index)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              title="Hapus Bahan"
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

          {/* Cost Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/40 px-5 py-3.5 dark:border-emerald-500/30 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <PackageCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Hasil Jadi: <strong>{actualQuantity} Porsi</strong> akan masuk ke stok gudang terpilih.
              </span>
            </div>

            <div className="flex items-center gap-5 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Total Biaya Bahan:</span>{" "}
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  Rp {Math.round(totalMaterialCost).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="border-l border-emerald-200 pl-4 dark:border-emerald-700">
                <span className="text-slate-500 dark:text-slate-400">HPP Produksi / Porsi:</span>{" "}
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  Rp {Math.round(costPerUnit).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
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
              className="bg-emerald-600 hover:bg-emerald-700 shadow-galaxy-cyan"
            >
              <Cpu className="h-3.5 w-3.5 mr-1.5" />
              <span>Selesaikan & Eksekusi Produksi</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
