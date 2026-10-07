"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Receipt,
  CreditCard,
  UtensilsCrossed,
  Clock,
  User,
  Store,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { Order, SelectOption } from "@/types";

export interface OrderDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  paymentMethodOptions: SelectOption[];
  onClose: () => void;
  onAddPayment: (orderId: string, paymentData: {
    paymentMethodId: string;
    amount: number;
    tenderedAmount?: number;
    referenceNumber?: string;
  }) => Promise<void>;
}

export function OrderDetailModal({
  isOpen,
  order,
  paymentMethodOptions,
  onClose,
  onAddPayment,
}: OrderDetailModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [payAmount, setPayAmount] = useState<number>(0);
  const [tenderedAmount, setTenderedAmount] = useState<number>(0);
  const [refNumber, setRefNumber] = useState("");
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  if (!isOpen || !order) return null;

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const remainingBalance = Math.max(0, Number(order.totalAmount) - Number(order.paidAmount));

  const handleQuickPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    const amountToPay = payAmount > 0 ? payAmount : remainingBalance;
    setIsSubmittingPay(true);
    try {
      await onAddPayment(order.orderId, {
        paymentMethodId: selectedMethod,
        amount: amountToPay,
        tenderedAmount: tenderedAmount > 0 ? tenderedAmount : amountToPay,
        referenceNumber: refNumber || undefined,
      });
      setSelectedMethod("");
      setPayAmount(0);
      setTenderedAmount(0);
      setRefNumber("");
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-galaxy-border dark:bg-galaxy-card my-8 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-galaxy-border/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-400/10 text-primary-500">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-heading">
                Detail Transaksi & Struk Kasir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {order.orderNumber} {order.invoiceNumber ? `• ${order.invoiceNumber}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Struk</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-galaxy-hover dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50/70 dark:bg-galaxy-thead border border-slate-200/60 dark:border-galaxy-border/50">
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Store className="h-3 w-3" /> Cabang Outlet
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                {order.outlet?.outletName || "-"}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Waktu Transaksi
              </span>
              <p className="font-mono font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                {formatDate(order.orderedAt)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <UtensilsCrossed className="h-3 w-3" /> Meja / Tipe
              </span>
              <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                {order.table?.tableName ? `Meja ${order.table.tableName}` : order.orderType}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <User className="h-3 w-3" /> Tamu / Kasir
              </span>
              <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                {order.customer?.customerName || order.guestName || "Walk-in Guest"}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <h4 className="font-semibold font-heading text-slate-800 dark:text-slate-100">
              Rincian Item Belanja ({order.items?.length || 0} Produk)
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-galaxy-border/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-galaxy-thead border-b border-slate-200/80 dark:border-galaxy-border/80 text-[11px] font-heading text-slate-600 dark:text-slate-300">
                    <th className="px-3 py-2">Item Produk</th>
                    <th className="px-3 py-2 text-center w-16">Qty</th>
                    <th className="px-3 py-2 text-right">Harga Satuan</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/40 font-mono">
                  {order.items?.map((it) => (
                    <tr key={it.orderItemId} className="hover:bg-slate-50/50 dark:hover:bg-galaxy-hover/30">
                      <td className="px-3 py-2.5">
                        <div className="font-sans font-medium text-slate-800 dark:text-slate-100">
                          {it.itemName}
                        </div>
                        {it.variantName && (
                          <div className="text-[11px] text-slate-500 font-sans">
                            Varian: {it.variantName}
                          </div>
                        )}
                        {it.modifiers && it.modifiers.length > 0 && (
                          <div className="text-[11px] text-primary-500 dark:text-primary-400 font-sans mt-0.5">
                            + {it.modifiers.map((m) => `${m.modifierItemName} (${formatCurrency(m.extraPrice)})`).join(", ")}
                          </div>
                        )}
                        {it.notes && (
                          <div className="text-[11px] text-amber-500 italic font-sans">
                            Note: {it.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-semibold">
                        {it.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300">
                        {formatCurrency(it.unitPrice)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(it.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Payment history list */}
            <div className="space-y-2">
              <h4 className="font-semibold font-heading text-slate-800 dark:text-slate-100">
                Riwayat Pembayaran
              </h4>
              <div className="space-y-2">
                {order.payments && order.payments.length > 0 ? (
                  order.payments.map((p) => (
                    <div
                      key={p.paymentId}
                      className="p-3 rounded-lg border border-slate-200/80 dark:border-galaxy-border/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                          <CreditCard className="h-3.5 w-3.5 text-primary-400" />
                          <span>{p.paymentMethodName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {p.paymentType}
                          </span>
                        </div>
                        {p.referenceNumber && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Ref: {p.referenceNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(p.amount)}
                        </div>
                        {Number(p.changeAmount) > 0 && (
                          <div className="text-[11px] text-slate-500">
                            Kembali: {formatCurrency(p.changeAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-galaxy-border text-slate-400 text-center">
                    Belum ada pembayaran yang tercatat.
                  </div>
                )}
              </div>

              {/* Form pelunasan jika belum lunas */}
              {remainingBalance > 0 && order.orderStatus !== "VOIDED" && (
                <form
                  onSubmit={handleQuickPay}
                  className="mt-3 p-3.5 rounded-lg border border-amber-200/80 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5 space-y-3"
                >
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold font-heading">
                    <AlertCircle className="h-4 w-4" />
                    <span>Pelunasan Sisa Tagihan ({formatCurrency(remainingBalance)})</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-300">
                        Metode Bayar
                      </label>
                      <SearchableSelect
                        size="sm"
                        options={paymentMethodOptions}
                        value={selectedMethod}
                        onChange={setSelectedMethod}
                        placeholder="Pilih Metode Pembayaran..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-600 dark:text-slate-300">
                          Nominal Bayar
                        </label>
                        <input
                          type="number"
                          placeholder={String(remainingBalance)}
                          value={payAmount || ""}
                          onChange={(e) => setPayAmount(Number(e.target.value))}
                          className="h-8 w-full rounded border border-slate-300 px-2 text-xs font-mono dark:border-galaxy-border dark:bg-galaxy-input"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 dark:text-slate-300">
                          Nomor Referensi (opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="No Trace / Approval"
                          value={refNumber}
                          onChange={(e) => setRefNumber(e.target.value)}
                          className="h-8 w-full rounded border border-slate-300 px-2 text-xs dark:border-galaxy-border dark:bg-galaxy-input"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!selectedMethod || isSubmittingPay}
                      className="w-full shadow-galaxy-cyan mt-1"
                    >
                      {isSubmittingPay ? "Memproses..." : "Konfirmasi Pembayaran"}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-galaxy-thead border border-slate-200/60 dark:border-galaxy-border/50 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal Item:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Potongan Diskon:</span>
                  <span>- {formatCurrency(order.discountAmount)}</span>
                </div>
              )}

              {Number(order.surchargeAmount) > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Biaya Layanan (Service Charge):</span>
                  <span>+ {formatCurrency(order.surchargeAmount)}</span>
                </div>
              )}

              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Pajak (PB1 / PPN):</span>
                  <span>+ {formatCurrency(order.taxAmount)}</span>
                </div>
              )}

              {Number(order.tipAmount) > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Tip / Donasi:</span>
                  <span>+ {formatCurrency(order.tipAmount)}</span>
                </div>
              )}

              <div className="border-t border-slate-200/80 dark:border-galaxy-border/80 pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                <span>Total Akhir:</span>
                <span className="text-primary-500 dark:text-primary-400">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <span>Sudah Dibayar:</span>
                <span>{formatCurrency(order.paidAmount)}</span>
              </div>

              {Number(order.changeAmount) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Kembalian:</span>
                  <span>{formatCurrency(order.changeAmount)}</span>
                </div>
              )}

              {remainingBalance > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold border-t border-dashed border-slate-200 pt-1">
                  <span>Sisa Tagihan:</span>
                  <span>{formatCurrency(remainingBalance)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/80 px-6 py-3.5 dark:border-galaxy-border/80">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
