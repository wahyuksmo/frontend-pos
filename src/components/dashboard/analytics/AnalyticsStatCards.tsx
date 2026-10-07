"use client";

import React from "react";
import { Users, Activity, Clock, ExternalLink, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface MetricCardItem {
  title: string;
  value: string;
  subValue?: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
}

export function AnalyticsStatCards() {
  const metrics: MetricCardItem[] = [
    {
      title: "Users",
      value: "28.05",
      subValue: "k",
      change: "16.24 %",
      isPositive: true,
      icon: Users,
    },
    {
      title: "Sessions",
      value: "97.66",
      subValue: "k",
      change: "3.96 %",
      isPositive: false,
      icon: Activity,
    },
    {
      title: "Avg. Visit Duration",
      value: "3m 40",
      subValue: "sec",
      change: "0.24 %",
      isPositive: false,
      icon: Clock,
    },
    {
      title: "Bounce Rate",
      value: "33.48",
      subValue: "%",
      change: "7.05 %",
      isPositive: true,
      icon: ExternalLink,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={index}
            className="border-slate-200/80 dark:border-galaxy-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-galaxy"
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-galaxy-muted">
                    {item.title}
                  </p>
                  <h3 className="text-2xl sm:text-[26px] font-bold text-slate-800 dark:text-slate-100 mt-2 font-heading tracking-tight">
                    {item.value}
                    {item.subValue && (
                      <span className="text-lg font-medium text-slate-500 dark:text-slate-400 ml-0.5">
                        {item.subValue}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 dark:text-galaxy-muted">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-semibold ${
                        item.isPositive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {item.isPositive ? (
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      )}
                      {item.change}
                    </span>
                    <span className="truncate">vs. previous month</span>
                  </div>
                </div>

                <div className="h-11 w-11 rounded-lg bg-primary-500/10 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-500/20">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
