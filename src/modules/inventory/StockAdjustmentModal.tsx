"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { inventoryService } from "@/services/inventory.service";
import { warehousesService, productsService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { SelectOption } from "@/types";

export interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemRow {
  productId: string;
  actualQuantity: number;
  notes: string;
}

export function StockAdjustmentModal({ isOpen, onClose, onSuccess }: StockAdjustmentModalProps) {
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("OPNAME");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { productId: "", actualQuantity: 0, notes: "" },
  ]);

  const [warehouseOptions, setWarehouseOptions] = useState<SelectOption[]>([]);
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      warehousesService.findAll({ limit: 100, isActive: "Y" }).then((res) => {
        setWarehouseOptions(
          (res.data || []).map((w) => ({ value: w.warehouseId, label: w.warehouseName }))
        );
        if (res.data && res.data.length > 0 && !warehouseId) {
          setWarehouseId(res.data[0].warehouseId);
        }
      });

      productsService.findAll({ limit: 200, isActive: "Y" }).then((res) => {
        setProductOptions(
          (res.data || []).map((p) => ({
            value: p.productId,
            label: `${p.productCode} - ${p.productName}`,
          }))
        );
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: "", actualQuantity: 0, notes: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemRow, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) {
      showErrorAlert("Validasi Gagal", "Silakan pilih gudang opname");
      return;
    }

    const validItems = items.filter((i) => i.productId);
    if (validItems.length === 0) {
      showErrorAlert("Validasi Gagal", "Minimal harus memilih satu produk");
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.createAdjustment({
        warehouseId,
        reason,
        notes,
        items: validItems.map((i) => ({
          productId: i.productId,
          actualQuantity: Number(i.actualQuantity),
          notes: i.notes || undefined,
        })),
      });

      showSuccessAlert("Berhasil", "Data penyesuaian stok opname berhasil disimpan dan saldo diperbarui");
      onSuccess();
    } catch (err: any) {
      showErrorAlert("Gagal Menyimpan", err.message || "Terjadi kesalahan saat memproses opname");
    } finally {
      setSubmitting(false);
    }
  };

  const reasonOptions = [
    { value: "OPNAME", label: "Stok Opname Rutin" },
    { value: "DAMAGED", label: "Barang Rusak / Pecah" },
    { value: "EXPIRED", label: "Barang Kadaluarsa (Expired)" },
    { value: "LOST", label: "Selisih Hilang" },
    { value: "OTHER", label: "Lainnya" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-xl dark:bg-galaxy-card border border-slate-200/80 dark:border-galaxy-border/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-heading">
              Formulir Penyesuaian / Stok Opname
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-galaxy-hover"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Gudang Lokasi Opname *
              </label>
              <SearchableSelect
                size="sm"
                options={warehouseOptions}
                value={warehouseId}
                onChange={setWarehouseId}
                placeholder="Pilih Gudang..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
                Alasan Penyesuaian *
              </label>
              <SearchableSelect
                size="sm"
                options={reasonOptions}
                value={reason}
                onChange={setReason}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200 font-heading">
              Catatan / Berita Acara
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan tambahan pelaksanaan opname..."
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100"
            />
          </div>

          {/* Table Items */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-heading">
                Daftar Barang yang Disesuaikan
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Baris</span>
              </Button>
            </div>

            <div className="rounded-lg border border-slate-200/80 dark:border-galaxy-border/80 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-[11px] font-semibold text-slate-500 dark:bg-galaxy-thead dark:text-slate-400 font-heading">
                  <tr>
                    <th className="py-2.5 px-3">Produk</th>
                    <th className="py-2.5 px-3 w-32">Kuantiti Aktual Fisik</th>
                    <th className="py-2.5 px-3">Keterangan Item</th>
                    <th className="py-2.5 px-2 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/60">
                  {items.map((row, idx) => (
                    <tr key={idx} className="bg-white dark:bg-galaxy-card">
                      <td className="p-2">
                        <SearchableSelect
                          size="sm"
                          options={productOptions}
                          value={row.productId}
                          onChange={(val) => handleItemChange(idx, "productId", val)}
                          placeholder="Pilih Produk..."
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          value={row.actualQuantity}
                          onChange={(e) =>
                            handleItemChange(idx, "actualQuantity", parseFloat(e.target.value) || 0)
                          }
                          className="h-8 w-full rounded border border-slate-300 bg-white px-2 font-mono text-xs dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Catatan..."
                          value={row.notes}
                          onChange={(e) => handleItemChange(idx, "notes", e.target.value)}
                          className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer inside form */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-200/80 dark:border-galaxy-border/80 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              className="shadow-galaxy-cyan"
            >
              Simpan & Perbarui Stok
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
