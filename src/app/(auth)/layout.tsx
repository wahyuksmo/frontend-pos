"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header with Brand and ThemeToggle */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
        {/* <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/logo-sm.png"
            alt="Velzon Logo"
            width={24}
            height={24}
            className="object-contain"
          />
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-wider text-slate-900 dark:text-white leading-none">
              VELZON<span className="text-primary-400">.</span>
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mt-0.5">
              Galaxy Edition
            </span>
          </div>
        </Link> */}
        <ThemeToggle />
      </header>

      {/* Main Centered Content */}
      <main className="flex items-center justify-center flex-1 my-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
