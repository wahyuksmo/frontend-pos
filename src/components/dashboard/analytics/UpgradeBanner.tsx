"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function UpgradeBanner() {
  return (
    <Card className="overflow-hidden mb-6 border-slate-200/80 dark:border-galaxy-border shadow-galaxy">
      <CardContent className="p-0">
        {/* Top Warning Alert Banner */}
        <div className="bg-primary-500/10 dark:bg-primary-950/40 border-b border-primary-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-primary-700 dark:text-primary-300">
          <div className="flex items-center space-x-2 truncate">
            <AlertTriangle className="h-4 w-4 text-primary-500 shrink-0" />
            <span className="truncate">
              Your free trial expired in <strong className="font-semibold text-slate-800 dark:text-slate-100">17</strong> days.
            </span>
          </div>
          <Link
            href="#"
            className="text-xs font-bold underline hover:text-primary-600 dark:hover:text-primary-200 shrink-0 ml-3"
          >
            Upgrade
          </Link>
        </div>

        {/* Content & Illustration */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center p-4 sm:p-5 gap-4">
          <div className="sm:col-span-8 space-y-3">
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              Upgrade your plan from a <span className="font-semibold text-primary-600 dark:text-primary-400">Free trial</span>, to ‘Premium Plan’
            </p>
            <div>
              <Button
                variant="primary"
                size="sm"
                className="shadow-galaxy-cyan font-semibold inline-flex items-center gap-1.5"
              >
                <span>Upgrade Account!</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="sm:col-span-4 flex justify-center sm:justify-end">
            <div className="relative w-28 h-24 sm:w-32 sm:h-28">
              <Image
                src="/images/user-illustarator-2.png"
                alt="Upgrade Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
