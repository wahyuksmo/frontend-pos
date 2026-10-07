"use client";

import React, { useState, useEffect } from "react";
import { Activity, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";
import Chart from "@/components/ui/Chart";

function generateHeatmapData(count: number, min: number, max: number) {
  const data: { x: string; y: number }[] = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      x: `${i}h`,
      y: Math.floor(Math.random() * (max - min + 1)) + min,
    });
  }
  return data;
}

export function AudiencesSessionsCard() {
  const [selectedSort, setSelectedSort] = useState("Current Week");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const series = [
    { name: "Sat", data: generateHeatmapData(18, 0, 90) },
    { name: "Fri", data: generateHeatmapData(18, 0, 90) },
    { name: "Thu", data: generateHeatmapData(18, 0, 90) },
    { name: "Wed", data: generateHeatmapData(18, 0, 90) },
    { name: "Tue", data: generateHeatmapData(18, 0, 90) },
    { name: "Mon", data: generateHeatmapData(18, 0, 90) },
    { name: "Sun", data: generateHeatmapData(18, 0, 90) },
  ];

  const options: ApexOptions = {
    chart: {
      height: 400,
      type: "heatmap",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    plotOptions: {
      heatmap: {
        radius: 2,
        enableShades: false,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 45,
              name: "Low (0-45k)",
              color: isDark ? "rgba(40, 167, 123, 0.22)" : "rgba(10, 122, 85, 0.22)",
            },
            {
              from: 46,
              to: 100,
              name: "High (46-100k)",
              color: isDark ? "#28a77b" : "#0a7a55",
            },
          ],
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: [isDark ? "#111c24" : "#ffffff"] },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      labels: { colors: isDark ? "#d2dce3" : "#475569" },
      markers: { size: 5 },
    },
    grid: { show: false },
    xaxis: {
      labels: {
        style: {
          colors: isDark ? "#8597a4" : "#64748b",
          fontSize: "10px",
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
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val: number) => `${val}k sessions`,
      },
    },
  };

  const sortOptions = ["Today", "Last Week", "Current Week", "Last Month", "Current Year"];

  return (
    <Card className="h-full flex flex-col border-slate-200/80 dark:border-galaxy-border shadow-galaxy">
      <CardHeader className="py-3 px-4 sm:px-5 flex flex-row items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border">
        <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span>Audiences Sessions by Country</span>
        </CardTitle>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-galaxy-muted hover:text-slate-900 dark:hover:text-slate-200 py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-galaxy-hover transition-colors"
          >
            <span className="font-semibold text-slate-400 uppercase text-2xs">Sort by: </span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{selectedSort}</span>
            <ChevronDown className="h-3.5 w-3.5 ml-0.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-galaxy-card border border-slate-200 dark:border-galaxy-border rounded-md shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedSort(opt);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    selectedSort === opt
                      ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-500/10 dark:bg-primary-400/15"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-galaxy-hover"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-4 flex-1">
        <div className="w-full h-[390px]">
          <Chart
            options={options}
            series={series}
            type="heatmap"
            height={390}
          />
        </div>
      </CardContent>
    </Card>
  );
}
