"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, MoreVertical } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface PageTraffic {
  path: string;
  active: number;
  usersPercent: string;
}

const TOP_PAGES: PageTraffic[] = [
  { path: "/themesbrand/skote-25867", active: 99, usersPercent: "25.3%" },
  { path: "/dashonic/chat-24518", active: 86, usersPercent: "22.7%" },
  { path: "/skote/timeline-27391", active: 64, usersPercent: "18.7%" },
  { path: "/themesbrand/minia-26441", active: 53, usersPercent: "14.2%" },
  { path: "/dashon/dashboard-29873", active: 33, usersPercent: "12.6%" },
  { path: "/doot/chats-29964", active: 20, usersPercent: "10.9%" },
  { path: "/minton/pages-29739", active: 10, usersPercent: "07.3%" },
];

export function TopPagesCard() {
  const [selectedRange, setSelectedRange] = useState("Today");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const ranges = ["Today", "Last Week", "Last Month", "Current Year"];

  return (
    <Card className="h-full flex flex-col border-slate-200/80 dark:border-galaxy-border shadow-galaxy">
      <CardHeader className="py-3 px-4 sm:px-5 flex flex-row items-center justify-between border-b border-slate-200/80 dark:border-galaxy-border">
        <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary-500" />
          <span>Top Pages</span>
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
                      ? "text-primary-500 font-semibold bg-primary-500/10"
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

      <CardContent className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-galaxy-thead border-b border-slate-200/80 dark:border-galaxy-border text-slate-500 dark:text-galaxy-muted">
              <th className="py-2.5 px-4 font-semibold">Active Page</th>
              <th className="py-2.5 px-3 font-semibold text-center">Active</th>
              <th className="py-2.5 px-4 font-semibold text-right">Users</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-galaxy-border/50 text-slate-700 dark:text-slate-200">
            {TOP_PAGES.map((page, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/60 dark:hover:bg-galaxy-hover/40 transition-colors"
              >
                <td className="py-2.5 px-4 max-w-[180px] sm:max-w-[220px] truncate">
                  <Link
                    href="#"
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    title={page.path}
                  >
                    {page.path}
                  </Link>
                </td>
                <td className="py-2.5 px-3 text-center font-semibold">{page.active}</td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-500 dark:text-slate-400">
                  {page.usersPercent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
