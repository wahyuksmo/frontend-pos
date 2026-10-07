"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { RegistersFilter, RegistersTable, RegistersModal } from "@/modules/registers";
import { registersService, outletsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Register, PaginationMeta, SelectOption } from "@/types";

export default function RegistersPage() {
  const [items, setItems] = useState<Register[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [outletOptions, setOutletOptions] = useState<SelectOption[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [outletId, setOutletId] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Register | null>(null);

  // Load outlet options for select
  useEffect(() => {
    outletsService
      .findAll({ limit: 100, isActive: "Y" })
      .then((res) => {
        const opts = (res.data || []).map((o) => ({
          value: o.outletId,
          label: `${o.outletCode} - ${o.outletName}`,
        }));
        setOutletOptions(opts);
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await registersService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        outletId: outletId || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data register.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, outletId, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Register) => {
    const result = await showConfirmDialog(
      "Hapus Register?",
      `Apakah Anda yakin ingin menghapus terminal kasir "${item.registerName}" (${item.registerCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await registersService.delete(item.registerId);
        showSuccessAlert("Berhasil Dihapus", "Register kasir berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus register.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Terminal Kasir" category="Master Data POS" />

      <RegistersFilter
        search={search}
        outletId={outletId}
        isActive={isActive}
        outletOptions={outletOptions}
        onSearchChange={setSearch}
        onOutletChange={setOutletId}
        onStatusChange={setIsActive}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setOutletId("");
          setIsActive("");
          setPage(1);
        }}
      />

      <RegistersTable
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

      <RegistersModal
        isOpen={isModalOpen}
        initialData={selectedItem}
        outletOptions={outletOptions}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
