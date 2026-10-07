"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname?.startsWith("/orders/create") || pathname?.startsWith("/pos")) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-100 text-slate-800 dark:bg-galaxy-body dark:text-galaxy-text transition-colors">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Wrapper */}
        <div
          className={cn(
            "flex flex-col min-h-screen transition-all duration-300",
            isCollapsed ? "lg:ml-[70px]" : "lg:ml-[250px]"
          )}
        >
          {/* Top Navbar */}
          <Navbar onOpenMobileSidebar={() => setMobileOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-5 lg:p-6 w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200/80 dark:border-galaxy-border px-6 py-3.5 text-center text-xs text-slate-400 dark:text-galaxy-menuTitle">
            <p>
              {new Date().getFullYear()} © POS Enterprise. Velzon Galaxy Design System.
            </p>
          </footer>
        </div>
      </div>
  );
}
