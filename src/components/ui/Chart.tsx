"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Props } from "react-apexcharts";

const ApexChartComponent = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full py-12 text-xs text-slate-400 dark:text-galaxy-muted">
      <div className="flex flex-col items-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <span>Memuat grafik...</span>
      </div>
    </div>
  ),
});

export function Chart(props: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center w-full"
        style={{ height: props.height || 300 }}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return <ApexChartComponent {...props} />;
}

export default Chart;
