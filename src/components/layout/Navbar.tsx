"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Menu,
  Bell,
  Search,
  Maximize2,
  Grid,
  Check,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserDropdown } from "./UserDropdown";
import { CompanySwitcher } from "./CompanySwitcher";

export interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export function Navbar({ onOpenMobileSidebar }: NavbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWebApps, setShowWebApps] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[70px] w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-md transition-colors dark:border-galaxy-border dark:bg-galaxy-header/90">
      {/* Left section: Hamburger button, Company Switcher & Quick Search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden dark:text-slate-400 dark:hover:bg-galaxy-hover dark:hover:text-slate-100 transition-colors"
          title="Buka Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <CompanySwitcher />

        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="h-[38px] w-64 lg:w-72 rounded border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400"
          />
        </div>
      </div>

      {/* Right section: Flag, Apps, Fullscreen, Dark/Light, Notifications, User */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language Flag */}
        <button
          type="button"
          title="Language: English"
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-galaxy-hover transition-colors"
        >
          <Image
            src="/images/flags/us.svg"
            alt="English"
            width={20}
            height={15}
            className="rounded-sm object-cover"
          />
        </button>

        {/* Web Apps Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowWebApps(!showWebApps)}
            title="Web Apps"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-galaxy-hover transition-colors"
          >
            <Grid className="h-4 w-4" />
          </button>

          {showWebApps && (
            <div className="absolute right-0 mt-2 w-72 rounded border border-slate-200 bg-white p-3 shadow-xl dark:border-galaxy-border dark:bg-galaxy-card z-50 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-galaxy-border/50">
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Web Apps
                </span>
                <span className="text-[11px] text-primary-600 dark:text-primary-400 font-medium">Lihat Semua</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {["GitHub", "Bitbucket", "Dribbble", "Dropbox", "Slack", "Mailchimp"].map((app) => (
                  <div
                    key={app}
                    onClick={() => setShowWebApps(false)}
                    className="p-2 rounded hover:bg-slate-100 dark:hover:bg-galaxy-hover cursor-pointer transition-colors"
                  >
                    <div className="h-7 w-7 mx-auto rounded bg-primary-400/10 text-primary-400 flex items-center justify-center font-bold text-xs mb-1">
                      {app.charAt(0)}
                    </div>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate block">
                      {app}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-galaxy-hover transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Theme Toggle (Dark/Light) */}
        <ThemeToggle />

        {/* Notifications Icon Button with badge */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-galaxy-hover transition-colors"
          title="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
            3
          </span>
        </button>

        {/* User Profile */}
        <div className="pl-1 sm:pl-2 ml-1 border-l border-slate-200 dark:border-galaxy-border">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
