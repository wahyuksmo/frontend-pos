"use client";

import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";
import Chart from "@/components/ui/Chart";

export function SessionsByCountriesCard() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "1M" | "6M">("1M");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const categories = [
    "India",
    "United States",
    "China",
    "Indonesia",
    "Russia",
    "Bangladesh",
    "Canada",
    "Brazil",
    "Vietnam",
    "UK",
  ];

  // Data series according to time filter
  const getSeriesData = () => {
    switch (activeFilter) {
      case "ALL":
        return [2100, 3450, 980, 2600, 2190, 1420, 1680, 890, 2240, 1200];
      case "6M":
        return [1500, 2400, 720, 1820, 1530, 990, 1180, 610, 1590, 850];
      case "1M":
      default:
        return [1010, 1640, 490, 1255, 1050, 689, 800, 420, 1085, 589];
    }
  };

  const series = [
    {
      name: "Sessions",
      data: getSeriesData(),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 380,
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        barHeight: "55%",
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: isDark
      ? [
          "rgba(40, 167, 123, 0.45)",
          "#28a77b", // United States (Top)
          "rgba(40, 167, 123, 0.45)",
          "#28a77b", // Indonesia
          "rgba(40, 167, 123, 0.65)",
          "rgba(40, 167, 123, 0.45)",
          "rgba(40, 167, 123, 0.55)",
          "rgba(40, 167, 123, 0.40)",
          "#28a77b", // Vietnam
          "rgba(40, 167, 123, 0.45)",
        ]
      : [
          "rgba(10, 122, 85, 0.45)",
          "#0a7a55", // United States (Top)
          "rgba(10, 122, 85, 0.45)",
          "#0a7a55", // Indonesia
          "rgba(10, 122, 85, 0.65)",
          "rgba(10, 122, 85, 0.45)",
          "rgba(10, 122, 85, 0.55)",
          "rgba(10, 122, 85, 0.40)",
          "#0a7a55", // Vietnam
          "rgba(10, 122, 85, 0.45)",
        ],
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 10,
      formatter: (val: number | string | number[]) => String(val),
      style: {
        fontSize: "11px",
        fontWeight: 600,
        colors: [isDark ? "#d2dce3" : "#475569"],
      },
    },
    legend: { show: false },
    grid: {
      show: true,
      borderColor: isDark ? "rgba(32, 50, 63, 0.6)" : "rgba(226, 232, 240, 0.8)",
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: isDark ? "#8597a4" : "#64748b",
          fontSize: "11px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#8597a4" : "#64748b",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val: number) => `${val.toLocaleString()} sessions`,
      },
    },
  };

  return (
    <Card className="h-full flex flex-col border-slate-200/80 dark:border-galaxy-border shadow-galaxy">
      <CardHeader className="py-3 px-4 sm:px-5 flex flex-row items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border">
        <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span>Sessions by Countries</span>
        </CardTitle>
        <div className="inline-flex rounded-md p-0.5 bg-slate-100 dark:bg-galaxy-body border border-slate-200 dark:border-galaxy-border">
          {(["ALL", "1M", "6M"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 text-2xs font-semibold rounded transition-colors ${
                activeFilter === filter
                  ? "bg-primary-600 text-white dark:bg-primary-400 dark:text-slate-950 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-4 flex-1">
        <div className="w-full h-[380px]">
          <Chart
            options={options}
            series={series}
            type="bar"
            height={380}
          />
        </div>
      </CardContent>
    </Card>
  );
}
