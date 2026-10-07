"use client";

import React, { useState } from "react";
import { Globe, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showSuccessAlert } from "@/lib/sweetalert";

const DURATION_DATA = [
  { duration: "0-30", sessions: "2,250", views: "4,250" },
  { duration: "31-60", sessions: "1,501", views: "2,050" },
  { duration: "61-120", sessions: "750", views: "1,600" },
  { duration: "121-240", sessions: "540", views: "1,040" },
];

const MARKERS = [
  { name: "Greenland", x: 260, y: 55 },
  { name: "Canada", x: 140, y: 75 },
  { name: "United States", x: 155, y: 110 },
  { name: "Brazil", x: 215, y: 200 },
  { name: "Norway", x: 315, y: 70 },
  { name: "Russia", x: 420, y: 75 },
  { name: "Egypt", x: 340, y: 135, hub: true },
  { name: "China", x: 450, y: 125 },
  { name: "Ukraine", x: 350, y: 90 },
];

export function LiveUsersMapCard() {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const handleExport = () => {
    showSuccessAlert("Laporan live users berhasil diexport!");
  };

  return (
    <Card className="h-full flex flex-col border-slate-200/80 dark:border-galaxy-border shadow-galaxy">
      <CardHeader className="py-3 px-4 sm:px-5 flex flex-row items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border">
        <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary-500" />
          <span>Live Users By Country</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="text-xs h-7 px-2.5 border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10"
        >
          <Download className="h-3 w-3 mr-1" />
          Export Report
        </Button>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* World Vector Map Visualization */}
        <div className="relative w-full h-56 bg-slate-50/50 dark:bg-galaxy-body/60 rounded-lg p-2 overflow-hidden border border-slate-200/60 dark:border-galaxy-border/60 flex items-center justify-center">
          <svg
            viewBox="0 0 600 280"
            className="w-full h-full text-slate-300 dark:text-slate-700/50 stroke-current"
            fill="none"
          >
            {/* World Continent Silhouettes (simplified crisp vectors) */}
            <path
              d="M90,60 Q130,40 180,60 Q210,90 190,130 Q140,150 110,120 Z"
              className="fill-slate-200/70 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700 stroke-[0.75]"
            />
            <path
              d="M170,160 Q220,155 240,195 Q230,260 190,270 Q160,230 170,160 Z"
              className="fill-slate-200/70 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700 stroke-[0.75]"
            />
            <path
              d="M290,50 Q360,40 370,85 Q340,110 300,95 Z"
              className="fill-slate-200/70 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700 stroke-[0.75]"
            />
            <path
              d="M285,120 Q360,115 375,160 Q345,235 315,225 Q275,170 285,120 Z"
              className="fill-slate-200/70 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700 stroke-[0.75]"
            />
            <path
              d="M375,55 Q510,45 540,105 Q520,165 440,160 Q390,135 375,55 Z"
              className="fill-slate-200/70 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700 stroke-[0.75]"
            />
            <path
              d="M480,190 Q545,185 550,235 Q500,260 475,225 Z"
              className="fill-slate-200/70 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700 stroke-[0.75]"
            />

            {/* Flight trajectories towards Egypt hub (340, 135) */}
            {MARKERS.filter((m) => !m.hub).map((m, i) => (
              <path
                key={i}
                d={`M${m.x},${m.y} Q${(m.x + 340) / 2},${Math.min(m.y, 135) - 25} 340,135`}
                className="stroke-primary-400/50 dark:stroke-primary-400/60 stroke-[1.25] fill-none"
                strokeDasharray="4 3"
              />
            ))}

            {/* Glowing Markers */}
            {MARKERS.map((m, i) => (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setActiveMarker(m.name)}
                onMouseLeave={() => setActiveMarker(null)}
              >
                {m.hub ? (
                  <>
                    <circle cx={m.x} cy={m.y} r="8" className="fill-primary-400/20 animate-ping" />
                    <circle cx={m.x} cy={m.y} r="5" className="fill-primary-400 stroke-white dark:stroke-galaxy-card stroke-2" />
                  </>
                ) : (
                  <>
                    <circle cx={m.x} cy={m.y} r="3.5" className="fill-primary-500 dark:fill-primary-400 stroke-white dark:stroke-galaxy-card stroke-1" />
                    <circle cx={m.x} cy={m.y} r="6" className="fill-primary-400/20" />
                  </>
                )}
              </g>
            ))}
          </svg>

          {/* Marker Tooltip */}
          {activeMarker && (
            <div className="absolute top-2 right-2 bg-slate-900 text-white text-2xs px-2 py-1 rounded shadow-md border border-slate-700">
              Active traffic: <span className="font-semibold text-primary-400">{activeMarker}</span>
            </div>
          )}
        </div>

        {/* Traffic Duration Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-dashed border-slate-200 dark:border-galaxy-border text-slate-400 dark:text-galaxy-muted">
                <th className="pb-2 font-medium">Duration (Secs)</th>
                <th className="pb-2 font-medium w-[30%]">Sessions</th>
                <th className="pb-2 font-medium w-[30%] text-right">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/50 text-slate-700 dark:text-slate-200 font-medium">
              {DURATION_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-galaxy-hover/30 transition-colors">
                  <td className="py-2 text-slate-500 dark:text-slate-400">{row.duration}</td>
                  <td className="py-2 font-semibold">{row.sessions}</td>
                  <td className="py-2 text-right">{row.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
