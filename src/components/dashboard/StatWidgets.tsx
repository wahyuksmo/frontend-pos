import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Clock,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function StatWidgets() {
  const stats = [
    {
      title: "TOTAL REVENUE",
      value: "Rp 548,25 Jt",
      change: "+16.24%",
      isPositive: true,
      icon: DollarSign,
      actionText: "Lihat detail omzet",
    },
    {
      title: "TRANSAKSI SUKSES",
      value: "36.894",
      change: "+29.08%",
      isPositive: true,
      icon: ShoppingBag,
      actionText: "Lihat semua order",
    },
    {
      title: "PENDING VERIFIKASI",
      value: "1.420",
      change: "-3.57%",
      isPositive: false,
      icon: Clock,
      actionText: "Perlu konfirmasi",
    },
    {
      title: "SALDO TERSEDIA",
      value: "Rp 165,89 Jt",
      change: "+0.00%",
      isPositive: null,
      icon: Wallet,
      actionText: "Tarik dana",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;

        return (
          <Card key={idx} className="transition-transform hover:-translate-y-0.5 duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-heading">
                  {stat.title}
                </span>
                <span
                  className={`inline-flex items-center text-xs font-semibold gap-0.5 ${
                    stat.isPositive === true
                      ? "text-emerald-500"
                      : stat.isPositive === false
                      ? "text-rose-500"
                      : "text-slate-400"
                  }`}
                >
                  {stat.isPositive === true && <TrendingUp className="h-3.5 w-3.5" />}
                  {stat.isPositive === false && <TrendingDown className="h-3.5 w-3.5" />}
                  {stat.change}
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <h4 className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </h4>
                  <span className="text-[11px] text-slate-400 hover:text-primary-400 cursor-pointer underline transition-colors">
                    {stat.actionText}
                  </span>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded bg-primary-400/15 text-primary-400 border border-primary-400/25">
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
