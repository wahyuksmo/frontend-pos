"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  QrCode,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Zap,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { paymentsService, GenerateQrisResponse } from "@/services/payments.service";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";

interface QrisPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orderNumber: string;
  amount: number;
  outletName?: string;
  customerName?: string;
  onSuccess: (data: any) => void;
}

export function QrisPaymentModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  amount,
  outletName,
  customerName,
  onSuccess,
}: QrisPaymentModalProps) {
  const [loading, setLoading] = useState(true);
  const [qrisData, setQrisData] = useState<GenerateQrisResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [status, setStatus] = useState<"PENDING" | "SUCCESS" | "EXPIRED" | "FAILED">("PENDING");
  const [checking, setChecking] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedOrderRef = useRef<string | null>(null);
  const onCloseRef = useRef(onClose);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onCloseRef.current = onClose;
    onSuccessRef.current = onSuccess;
  });

  const fetchQris = useCallback(() => {
    setLoading(true);
    setStatus("PENDING");
    setTimeLeft(300);

    paymentsService
      .generateQris({
        orderId,
        orderNumber,
        amount,
        outletName,
        customerName,
      })
      .then((res) => {
        if (res.data) {
          setQrisData(res.data);
        }
      })
      .catch((err: any) => {
        showErrorAlert(
          "Gagal Membuat QRIS",
          err?.response?.data?.message || err?.message || "Koneksi gateway bermasalah"
        );
        onCloseRef.current();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId, orderNumber, amount, outletName, customerName]);

  // Generate QRIS saat modal pertama kali dibuka untuk order ini
  useEffect(() => {
    if (!isOpen) {
      initializedOrderRef.current = null;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setQrisData(null);
      setStatus("PENDING");
      return;
    }

    // Jika sudah diinisialisasi untuk order ini, jangan generate ulang
    if (initializedOrderRef.current === (orderId || orderNumber)) {
      return;
    }

    initializedOrderRef.current = orderId || orderNumber;
    fetchQris();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, orderId, orderNumber, fetchQris]);

  // Timer Countdown
  useEffect(() => {
    if (!isOpen || status !== "PENDING" || !qrisData) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setStatus("EXPIRED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, status, qrisData]);

  // Polling Status QRIS
  useEffect(() => {
    if (!isOpen || !qrisData || status !== "PENDING") return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await paymentsService.checkStatus(qrisData.transactionId);
        if (res.data && res.data.status === "SUCCESS") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setStatus("SUCCESS");
          setTimeout(() => {
            onSuccessRef.current(res.data);
          }, 1000);
        } else if (res.data && res.data.status === "EXPIRED") {
          setStatus("EXPIRED");
        }
      } catch (err) {
        // silent capture in background polling
      }
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, qrisData, status]);

  // Manual Trigger Check Status
  const handleManualCheck = async () => {
    if (!qrisData) return;
    try {
      setChecking(true);
      const res = await paymentsService.checkStatus(qrisData.transactionId);
      if (res.data?.status === "SUCCESS") {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setStatus("SUCCESS");
        setTimeout(() => {
          onSuccessRef.current(res.data);
        }, 1000);
      } else {
        showSuccessAlert("Status Terkini", `Status pembayaran saat ini: ${res.data?.status || "PENDING"}`);
      }
    } catch (err: any) {
      showErrorAlert("Cek Status Gagal", err?.message || "Gagal menghubungi server");
    } finally {
      setChecking(false);
    }
  };

  // Simulasikan Pembayaran Pelanggan (Mock / Demo Fast-forward)
  const handleSimulatePayment = async () => {
    if (!qrisData) return;
    try {
      setSimulating(true);
      const res = await paymentsService.simulateSuccess(qrisData.transactionId);
      if (res.data?.payment?.status === "SUCCESS") {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setStatus("SUCCESS");
        showSuccessAlert(
          "Pembayaran Diterima!",
          `Simulasi transfer berhasil. Order ${orderNumber} lunas.`
        );
        setTimeout(() => {
          onSuccessRef.current(res.data);
        }, 800);
      }
    } catch (err: any) {
      showErrorAlert("Simulasi Gagal", err?.response?.data?.message || err?.message || "Terjadi kesalahan simulator");
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-galaxy-card border border-slate-200/80 dark:border-galaxy-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-galaxy-border/50 bg-slate-50/50 dark:bg-galaxy-header/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-800 dark:text-slate-100">
                Dynamic QRIS Payment
              </h3>
              <p className="text-2xs text-slate-500 dark:text-galaxy-muted">
                {orderNumber} {outletName ? `• ${outletName}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-galaxy-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 text-primary-500 animate-spin" />
              <p className="text-xs text-slate-500 dark:text-galaxy-muted">
                Menghubungi Payment Gateway...
              </p>
            </div>
          ) : status === "SUCCESS" ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h4 className="text-base font-bold font-heading text-emerald-600 dark:text-emerald-400">
                Pembayaran Berhasil!
              </h4>
              <p className="text-xs text-slate-500 dark:text-galaxy-muted">
                Dana sebesar{" "}
                <strong className="font-mono text-slate-800 dark:text-slate-200">
                  Rp {amount.toLocaleString("id-ID")}
                </strong>{" "}
                telah diverifikasi otomatis.
              </p>
            </div>
          ) : status === "EXPIRED" ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h4 className="text-base font-bold font-heading text-rose-600 dark:text-rose-400">
                QRIS Telah Kadaluarsa
              </h4>
              <p className="text-xs text-slate-500 dark:text-galaxy-muted">
                Batas waktu pembayaran habis. Silakan buat kode QRIS baru.
              </p>
              <button
                type="button"
                onClick={fetchQris}
                className="mt-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
              >
                Buat QRIS Baru
              </button>
            </div>
          ) : (
            <>
              {/* Grand Total Amount Badge */}
              <div className="w-full bg-slate-50 dark:bg-galaxy-input/60 border border-slate-200/70 dark:border-galaxy-border/70 rounded-xl p-3 mb-4">
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-galaxy-muted block">
                  Total Tagihan
                </span>
                <span className="text-xl font-black font-mono text-primary-600 dark:text-primary-400">
                  Rp {amount.toLocaleString("id-ID")}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="relative p-3.5 bg-white rounded-2xl shadow-lg border-2 border-slate-200/60 dark:border-galaxy-border flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-2xs font-bold text-slate-700">
                  <div className="flex items-center gap-1 text-rose-600 font-black">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>QRIS</span>
                  </div>
                  <span className="text-slate-400 font-mono text-3xs">STANDAR BI</span>
                </div>

                {qrisData?.qrDataUrl ? (
                  <img
                    src={qrisData.qrDataUrl}
                    alt="Dynamic QRIS Code"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 bg-slate-100 flex items-center justify-center text-slate-400">
                    Memuat QR...
                  </div>
                )}

                <div className="w-full pt-2 mt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-3xs text-slate-400 font-medium">
                  <Smartphone className="h-3 w-3" />
                  <span>Scan via BCA, Mandiri, GoPay, OVO, ShopeePay, Dana</span>
                </div>
              </div>

              {/* Countdown & Status */}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formattedTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-2xs text-slate-500 dark:text-galaxy-muted">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                  </span>
                  <span>Menunggu scan pelanggan...</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {status === "PENDING" && !loading && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-galaxy-border/50 bg-slate-50/70 dark:bg-galaxy-header/50 flex flex-col gap-2">
            {/* Developer Fast-Forward Simulator Button */}
            <button
              type="button"
              disabled={simulating}
              onClick={handleSimulatePayment}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-heading font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>
                {simulating ? "Memproses Verifikasi..." : "⚡ Simulasikan Pembayaran Berhasil"}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={checking}
                onClick={handleManualCheck}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-galaxy-border bg-white dark:bg-galaxy-input hover:bg-slate-50 dark:hover:bg-galaxy-hover text-slate-700 dark:text-slate-200 text-2xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${checking ? "animate-spin" : ""}`} />
                <span>Cek Status</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-galaxy-border text-slate-500 dark:text-galaxy-muted hover:text-slate-700 dark:hover:text-slate-200 text-2xs font-semibold transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
