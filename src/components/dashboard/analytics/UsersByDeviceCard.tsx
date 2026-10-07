"use client";

import React, { useState, useEffect } from "react";
import { Laptop, Smartphone, Tablet, MoreVertical, ArrowUpRight, ArrowDownRight, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";
import Chart from "@/components/ui/Chart";

export function UsersByDeviceCard() {
  const [selectedRange, setSelectedRange] = useState("Today");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const series = [78.56, 105.02, 42.89];

  const options: ApexOptions = {
    chart: {
      type: "donut",
      height: 220,
      fontFamily: "inherit",
    },
    labels: ["Desktop Users", "Mobile Users", "Tablet Users"],
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              color: isDark ? "#8597a4" : "#64748b",
              offsetY: -5,
            },
            value: {
              show: true,
              fontSize: "18px",
              fontWeight: 700,
              color: isDark ? "#d2dce3" : "#1c262b",
              offsetY: 5,
              formatter: (val: string) => `${val}k`,
            },
            total: {
              show: true,
              label: "Total Users",
              fontSize: "11px",
              color: isDark ? "#8597a4" : "#64748b",
              formatter: () => "226.47k",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2, colors: [isDark ? "#111c24" : "#ffffff"] },
    colors: isDark ? ["#28a77b", "#d97706", "#0284c7"] : ["#0a7a55", "#d97706", "#0284c7"],
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val: number) => `${val}k Users`,
      },
    },
  };

  const devices = [
    {
      name: "Desktop Users",
      count: "78.56k",
      change: "2.08%",
      isPositive: true,
      color: "bg-primary-600 dark:bg-primary-400",
      icon: Laptop,
    },
    {
      name: "Mobile Users",
      count: "105.02k",
      change: "10.52%",
      isPositive: false,
      color: "bg-amber-600 dark:bg-amber-500",
      icon: Smartphone,
    },
    {
      name: "Tablet Users",
      count: "42.89k",
      change: "7.36%",
      isPositive: false,
      color: "bg-sky-600 dark:bg-sky-500",
      icon: Tablet,
    },
  ];

  const ranges = ["Today", "Last Week", "Last Month", "Current Year"];

  return (
    <Card className="h-full flex flex-col border-slate-200/80 dark:border-galaxy-border shadow-galaxy">
      <CardHeader className="py-3 px-4 sm:px-5 flex flex-row items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border">
        <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Laptop className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span>Users by Device</span>
        </CardTitle>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-galaxy-hover"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-galaxy-card border border-slate-200 dark:border-galaxy-border rounded-md shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              {ranges.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRange(r);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    selectedRange === r
                      ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-500/10 dark:bg-primary-400/15"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-galaxy-hover"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* Donut Chart */}
        <div className="w-full flex justify-center py-2">
          <Chart
            options={options}
            series={series}
            type="donut"
            height={220}
          />
        </div>

        {/* Breakdown List */}
        <div className="mt-4 divide-y divide-slate-100 dark:divide-galaxy-border/50 text-xs">
          {devices.map((device, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`h-2.5 w-2.5 rounded-full ${device.color}`} />
                <span className="font-medium text-slate-700 dark:text-slate-200">{device.name}</span>
              </div>
              <div className="flex items-center space-x-3 text-right">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Users className="h-3 w-3 text-slate-400" />
                  {device.count}
                </span>
                <span
                  className={`inline-flex items-center font-semibold text-2xs ${
                    device.isPositive
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-rose-500 dark:text-rose-400"
                  }`}
                >
                  {device.isPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {device.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
