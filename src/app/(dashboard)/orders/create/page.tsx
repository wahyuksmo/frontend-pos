"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PosTerminal } from "@/modules/orders/PosTerminal";
import {
  outletsService,
  diningTablesService,
  customersService,
  paymentMethodsService,
  productsService,
  categoriesService,
  discountsService,
  shiftsService,
} from "@/services";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { SelectOption, Product, Category, Discount } from "@/types";

export default function CreateOrderPage() {
  const [loading, setLoading] = useState(true);
  const [outletOptions, setOutletOptions] = useState<SelectOption[]>([]);
  const [tableOptions, setTableOptions] = useState<SelectOption[]>([]);
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<SelectOption[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [
        outletsRes,
        tablesRes,
        customersRes,
        paymentMethodsRes,
        productsRes,
        categoriesRes,
        discountsRes,
        shiftRes,
      ] = await Promise.allSettled([
        outletsService.findAll({ limit: 100, isActive: "Y" }),
        diningTablesService.findAll({ limit: 100, isActive: "Y" }),
        customersService.findAll({ limit: 200, isActive: "Y" }),
        paymentMethodsService.findAll({ limit: 100, isActive: "Y" }),
        productsService.findAll({ limit: 500, isActive: "Y", isForSale: "Y" }),
        categoriesService.findAll({ limit: 100, isActive: "Y" }),
        discountsService.findAll({ limit: 100, isActive: "Y" }),
        shiftsService.getActive(),
      ]);

      if (outletsRes.status === "fulfilled" && outletsRes.value.data) {
        setOutletOptions(
          outletsRes.value.data.map((o) => ({
            value: o.outletId,
            label: o.outletName,
          }))
        );
      }

      if (tablesRes.status === "fulfilled" && tablesRes.value.data) {
        setTableOptions(
          tablesRes.value.data.map((t) => ({
            value: t.tableId,
            label: `Meja ${t.tableName}`,
          }))
        );
      }

      if (customersRes.status === "fulfilled" && customersRes.value.data) {
        setCustomerOptions(
          customersRes.value.data.map((c) => ({
            value: c.customerId,
            label: `${c.customerCode} - ${c.customerName}`,
          }))
        );
      }

      if (paymentMethodsRes.status === "fulfilled" && paymentMethodsRes.value.data) {
        setPaymentMethodOptions(
          paymentMethodsRes.value.data.map((pm) => ({
            value: pm.paymentMethodId,
            label: `${pm.methodName} (${pm.methodType})`,
          }))
        );
      }

      if (productsRes.status === "fulfilled" && productsRes.value.data) {
        setProducts(productsRes.value.data);
      }

      if (categoriesRes.status === "fulfilled" && categoriesRes.value.data) {
        setCategories(categoriesRes.value.data);
      }

      if (discountsRes.status === "fulfilled" && discountsRes.value.data) {
        setDiscounts(discountsRes.value.data);
      }

      if (shiftRes.status === "fulfilled" && shiftRes.value.data) {
        setActiveShiftId(shiftRes.value.data.shiftId);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-galaxy-body text-slate-700 dark:text-galaxy-text">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-xs font-medium text-slate-500 dark:text-galaxy-muted">Menyiapkan Terminal Kasir POS...</p>
      </div>
    );
  }

  return (
    <PosTerminal
      outletOptions={outletOptions}
      tableOptions={tableOptions}
      customerOptions={customerOptions}
      paymentMethodOptions={paymentMethodOptions}
      products={products}
      categories={categories}
      discounts={discounts}
      activeShiftId={activeShiftId}
      onRefreshData={loadData}
    />
  );
}
