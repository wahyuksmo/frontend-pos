"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import { CustomersFilter, CustomersTable, CustomersModal } from "@/modules/customers";
import { customersService, customerGroupsService } from "@/services";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/lib/sweetalert";
import type { Customer, PaginationMeta, SelectOption } from "@/types";

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [groupOptions, setGroupOptions] = useState<SelectOption[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [customerGroupId, setCustomerGroupId] = useState("");
  const [isActive, setIsActive] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Customer | null>(null);

  const loadGroupOptions = useCallback(() => {
    customerGroupsService
      .findAll({ limit: 100, isActive: "Y" })
      .then((res) => {
        const opts = (res.data || []).map((g) => ({
          value: g.customerGroupId,
          label: `${g.groupCode} - ${g.groupName}`,
        }));
        setGroupOptions(opts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadGroupOptions();
  }, [loadGroupOptions]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customersService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        customerGroupId: customerGroupId || undefined,
        isActive: isActive || undefined,
      });
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Data", err.message || "Terjadi kesalahan saat memuat data pelanggan.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, customerGroupId, isActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Customer) => {
    const result = await showConfirmDialog(
      "Hapus Pelanggan?",
      `Apakah Anda yakin ingin menghapus pelanggan "${item.customerName}" (${item.customerCode})?`,
      "Ya, Hapus!"
    );

    if (result.isConfirmed) {
      try {
        await customersService.delete(item.customerId);
        showSuccessAlert("Berhasil Dihapus", "Data pelanggan berhasil dihapus.");
        fetchData();
      } catch (err: any) {
        showErrorAlert("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus pelanggan.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Data Pelanggan" category="Master Data POS" />

      <CustomersFilter
        search={search}
        customerGroupId={customerGroupId}
        isActive={isActive}
        groupOptions={groupOptions}
        onSearchChange={setSearch}
        onGroupChange={setCustomerGroupId}
        onStatusChange={setIsActive}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setCustomerGroupId("");
          setIsActive("");
          setPage(1);
        }}
      />

      <CustomersTable
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

      <CustomersModal
        isOpen={isModalOpen}
        initialData={selectedItem}
        groupOptions={groupOptions}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
