"use client";

import React, { useState, useEffect } from "react";
import { Users2, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";
import Chart from "@/components/ui/Chart";

export function AudiencesMetricsCard() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "1M" | "6M" | "1Y">("1Y");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const series = [
    {
      name: "Last Year",
      data: [25.3, 12.5, 20.2, 18.5, 40.4, 25.4, 15.8, 22.3, 19.2, 25.3, 12.5, 20.2],
    },
    {
      name: "Current Year",
      data: [36.2, 22.4, 38.2, 30.5, 26.4, 30.4, 20.2, 29.6, 10.9, 36.2, 22.4, 38.2],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 310,
      stacked: true,
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "22%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    colors: isDark ? ["#20323f", "#28a77b"] : ["#cbd5e1", "#0a7a55"],
    grid: {
      show: true,
      borderColor: isDark ? "rgba(32, 50, 63, 0.6)" : "rgba(226, 232, 240, 0.8)",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
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
          fontSize: "11px",
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        colors: isDark ? "#d2dce3" : "#475569",
      },
      markers: {
        size: 5,
      },
      itemMargin: {
        horizontal: 14,
        vertical: 4,
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val: number) => `${val}k visits`,
      },
    },
  };

  return (
    <Card className="h-full flex flex-col border-slate-200/80 dark:border-galaxy-border shadow-galaxy">
      {/* Card Header with Filter Buttons */}
      <CardHeader className="py-3 px-4 sm:px-5 flex flex-row items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border">
        <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Users2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span>Audiences Metrics</span>
        </CardTitle>
        <div className="inline-flex rounded-md p-0.5 bg-slate-100 dark:bg-galaxy-body border border-slate-200 dark:border-galaxy-border">
          {(["ALL", "1M", "6M", "1Y"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-2 py-0.5 text-2xs font-semibold rounded transition-colors ${
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

      {/* 3 Metric Ribbon Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-dashed border-slate-200 dark:border-galaxy-border bg-slate-50/50 dark:bg-galaxy-body/30">
        <div className="p-3 sm:p-4 text-center border-b sm:border-b-0 sm:border-r border-dashed border-slate-200 dark:border-galaxy-border">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 font-heading">
            <span>854</span>
            <span className="text-emerald-500 text-xs font-semibold inline-flex items-center">
              49% <ArrowUpRight className="h-3 w-3" />
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-galaxy-muted mt-0.5">Avg. Session</p>
        </div>

        <div className="p-3 sm:p-4 text-center border-b sm:border-b-0 sm:border-r border-dashed border-slate-200 dark:border-galaxy-border">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 font-heading">
            <span>1,278</span>
            <span className="text-emerald-500 text-xs font-semibold inline-flex items-center">
              60% <ArrowUpRight className="h-3 w-3" />
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-galaxy-muted mt-0.5">Conversion Rate</p>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 font-heading">
            <span>3m 40sec</span>
            <span className="text-emerald-500 text-xs font-semibold inline-flex items-center">
              37% <ArrowUpRight className="h-3 w-3" />
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-galaxy-muted mt-0.5">Avg. Session Duration</p>
        </div>
      </div>

      {/* Chart */}
      <CardContent className="p-2 sm:p-4 flex-1">
        <div className="w-full h-[310px]">
          <Chart
            options={options}
            series={series}
            type="bar"
            height={310}
          />
        </div>
      </CardContent>
    </Card>
  );
}
