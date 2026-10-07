"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import {
  ShiftsFilter,
  ShiftsTable,
  OpenShiftModal,
  CloseShiftModal,
  CashMovementModal,
} from "@/modules/shifts";
import { shiftsService, outletsService, registersService } from "@/services";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";
import type { RegisterShift, PaginationMeta, SelectOption } from "@/types";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<RegisterShift[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [outletId, setOutletId] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [outletOptions, setOutletOptions] = useState<SelectOption[]>([]);
  const [registerOptions, setRegisterOptions] = useState<SelectOption[]>([]);

  // Modals
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<RegisterShift | null>(null);

  useEffect(() => {
    outletsService
      .findAll({ limit: 100, isActive: "Y" })
      .then((res) => {
        setOutletOptions((res.data || []).map((o) => ({ value: o.outletId, label: o.outletName })));
      })
      .catch(() => {});

    registersService
      .findAll({ limit: 100, isActive: "Y" })
      .then((res) => {
        setRegisterOptions((res.data || []).map((r) => ({ value: r.registerId, label: `${r.registerCode} - ${r.registerName}` })));
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shiftsService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        outletId: outletId || undefined,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setShifts(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Sesi Kasir", err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, outletId, status, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenShift = async (data: { outletId: string; registerId: string; openingCash: number }) => {
    try {
      await shiftsService.open(data);
      showSuccessAlert("Sesi Kasir Dibuka", "Sesi kasir berhasil dibuka.");
      fetchData();
    } catch (err: any) {
      showErrorAlert("Gagal Membuka Shift", err.message || "Terjadi kesalahan.");
      throw err;
    }
  };

  const handleCloseShift = async (shiftId: string, data: { actualCash: number; closingNotes?: string }) => {
    try {
      await shiftsService.close(shiftId, data);
      showSuccessAlert("Sesi Kasir Ditutup", "Sesi kasir berhasil ditutup.");
      fetchData();
    } catch (err: any) {
      showErrorAlert("Gagal Menutup Shift", err.message || "Terjadi kesalahan.");
      throw err;
    }
  };

  const handleCashMovement = async (
    shiftId: string,
    data: { movementType: "CASH_IN" | "CASH_OUT"; amount: number; reason: string; recipient?: string; authorizedBy?: string },
  ) => {
    try {
      await shiftsService.addCashMovement(shiftId, data);
      showSuccessAlert("Mutasi Kas Berhasil", "Mutasi kas kecil berhasil dicatat.");
      fetchData();
    } catch (err: any) {
      showErrorAlert("Gagal Mencatat Mutasi", err.message || "Terjadi kesalahan.");
      throw err;
    }
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Sesi Kasir (Shift)" category="Operasional Kasir" />

      <ShiftsFilter
        search={search}
        outletId={outletId}
        status={status}
        startDate={startDate}
        endDate={endDate}
        outletOptions={outletOptions}
        onSearchChange={setSearch}
        onOutletChange={setOutletId}
        onStatusChange={setStatus}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilter={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setOutletId("");
          setStatus("");
          setStartDate("");
          setEndDate("");
          setPage(1);
        }}
      />

      <ShiftsTable
        data={shifts}
        meta={meta}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onOpenCreate={() => setIsOpenModalOpen(true)}
        onOpenCloseShift={(s) => {
          setSelectedShift(s);
          setIsCloseModalOpen(true);
        }}
        onOpenCashMovement={(s) => {
          setSelectedShift(s);
          setIsMovementModalOpen(true);
        }}
      />

      <OpenShiftModal
        isOpen={isOpenModalOpen}
        outletOptions={outletOptions}
        registerOptions={registerOptions}
        onClose={() => setIsOpenModalOpen(false)}
        onSubmit={handleOpenShift}
      />

      <CloseShiftModal
        isOpen={isCloseModalOpen}
        shift={selectedShift}
        onClose={() => setIsCloseModalOpen(false)}
        onSubmit={handleCloseShift}
      />

      <CashMovementModal
        isOpen={isMovementModalOpen}
        shift={selectedShift}
        onClose={() => setIsMovementModalOpen(false)}
        onSubmit={handleCashMovement}
      />
    </div>
  );
}
