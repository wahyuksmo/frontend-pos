"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Layers,
  Users,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  MenuSquare,
  LockKeyhole,
  Database,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  FileEdit,
  Building2,
  Briefcase,
  Target,
  UserPlus,
  Receipt,
  GraduationCap,
  Megaphone,
  Clock,
  Calendar,
  Heart,
  Landmark,
  BookOpen,
  UserCheck,
  FileText,
  Store,
  Monitor,
  UtensilsCrossed,
  Printer,
  ShoppingBag,
  ShoppingCart,
  Package,
  Tag,
  Utensils,
  Scale,
  ArrowLeftRight,
  Warehouse,
  Truck,
  BadgePercent,
  CreditCard,
  Percent,
  GitPullRequest,
  Settings,
  BarChart3,
  TrendingUp,
  Cpu,
  Smartphone,
  Download,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { menusService } from "@/services";
import type { Menu } from "@/types";

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

// Icon mapping dictionary
const ICON_MAP: Record<string, any> = {
  layoutdashboard: LayoutDashboard,
  dashboard: LayoutDashboard,
  database: Database,
  users: Users,
  users2: Users,
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  shieldalert: ShieldAlert,
  key: KeyRound,
  keyround: KeyRound,
  menu: MenuSquare,
  menusquare: MenuSquare,
  lock: LockKeyhole,
  lockkeyhole: LockKeyhole,
  layers: Layers,
  fileedit: FileEdit,
  filetext: FileText,
  building: Building2,
  building2: Building2,
  briefcase: Briefcase,
  target: Target,
  userplus: UserPlus,
  usercheck: UserCheck,
  receipt: Receipt,
  graduationcap: GraduationCap,
  bookopen: BookOpen,
  clock: Clock,
  calendar: Calendar,
  heart: Heart,
  landmark: Landmark,
  megaphone: Megaphone,
  store: Store,
  monitor: Monitor,
  utensilscrossed: UtensilsCrossed,
  printer: Printer,
  shoppingbag: ShoppingBag,
  shoppingcart: ShoppingCart,
  package: Package,
  tag: Tag,
  utensils: Utensils,
  scale: Scale,
  arrowleftright: ArrowLeftRight,
  warehouse: Warehouse,
  truck: Truck,
  badgepercent: BadgePercent,
  creditcard: CreditCard,
  percent: Percent,
  receiptpercent: Receipt,
  gitpullrequest: GitPullRequest,
  settings: Settings,
  barchart: BarChart3,
  barchart3: BarChart3,
  trendingup: TrendingUp,
  reports: BarChart3,
  cpu: Cpu,
  smartphone: Smartphone,
  download: Download,
  apk: Smartphone,
  mobile: Smartphone,
  qrcode: QrCode,
};

const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName) return Layers;
  const key = iconName.toLowerCase().replace(/[^a-z]/g, "");
  return ICON_MAP[key] || Layers;
};

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();

  // Dynamic Navigation state strictly loaded from Backend API (No hardcoded fallback menus)
  const [dynamicMenuTree, setDynamicMenuTree] = useState<Menu[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const normalizeUrl = (url: string | null | undefined): string => {
    if (!url) return "#";
    if (url.startsWith("/dashboard/")) {
      return url.replace("/dashboard/", "/");
    }
    if (url === "/dashboard") return "/";
    return url;
  };

  const isActiveRoute = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const normalized = normalizeUrl(url);
    return pathname === normalized || pathname === url;
  };

  // Fetch dynamic permitted menu navigation directly from backend API
  useEffect(() => {
    let isMounted = true;
    const loadNavigation = async () => {
      setIsLoadingMenu(true);
      try {
        let navData: Menu[] = [];
        try {
          const res = await menusService.getNavigation();
          if (res.data && res.data.length > 0) {
            navData = res.data;
          }
        } catch {
          // Fallback to getTree if getNavigation is unauthenticated or fails
          try {
            const treeRes = await menusService.getTree();
            if (treeRes.data && treeRes.data.length > 0) {
              navData = treeRes.data;
            }
          } catch (treeErr) {
            console.warn("Could not load backend tree menus", treeErr);
          }
        }

        if (isMounted) {
          setDynamicMenuTree(navData);
        }
      } catch (err) {
        console.warn("Could not load backend navigation", err);
      } finally {
        if (isMounted) {
          setIsLoadingMenu(false);
        }
      }
    };

    loadNavigation();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Auto-expand active parent submenu on route change
  useEffect(() => {
    dynamicMenuTree.forEach((m) => {
      const isDirectChildActive = m.children?.some((c) => isActiveRoute(c.menuUrl));
      const isGrandChildActive = m.children?.some((c) => c.children?.some((gc) => isActiveRoute(gc.menuUrl)));
      if (isDirectChildActive || isGrandChildActive) {
        setOpenSubmenus((prev) => ({ ...prev, [m.menuName]: true }));
      }
      m.children?.forEach((c) => {
        if (c.children?.some((gc) => isActiveRoute(gc.menuUrl))) {
          setOpenSubmenus((prev) => ({ ...prev, [c.menuName]: true }));
        }
      });
    });
  }, [pathname, dynamicMenuTree]);

  const toggleSubmenu = (menuName: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-md transition-all duration-300 dark:border-galaxy-border/80 dark:bg-galaxy-sidebar/95 dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)]",
          isCollapsed ? "lg:w-[70px]" : "lg:w-[250px]",
          mobileOpen ? "translate-x-0 w-[250px]" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand / Logo Header */}
        <div className="relative flex h-[70px] items-center justify-between px-5 border-b border-slate-100 dark:border-galaxy-border/80 bg-slate-50/30 dark:bg-galaxy-sidebar">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            {isCollapsed && !mobileOpen ? (
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary-400/10 border border-primary-400/20">
                <Image
                  src="/images/logo-sm.png"
                  alt="Velzon"
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logo-light.png"
                  alt="Velzon"
                  width={105}
                  height={20}
                  className="hidden dark:block object-contain"
                  priority
                />
                <Image
                  src="/images/logo-dark.png"
                  alt="Velzon"
                  width={105}
                  height={20}
                  className="block dark:hidden object-contain"
                  priority
                />
                <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 font-heading tracking-widest ml-0.5 bg-primary-500/10 dark:bg-primary-400/15 border border-primary-500/20 dark:border-primary-400/25 px-1.5 py-0.5 rounded">
                  POS
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-galaxy-hover text-slate-400 dark:text-galaxy-menuTitle hover:text-slate-700 dark:hover:text-white transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic POS Navigation Items from Backend */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-galaxy-border">
          {(!isCollapsed || mobileOpen) && (
            <div className="flex items-center justify-between px-3 pt-1 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-galaxy-menuTitle font-heading">
                NAVIGASI POS
              </p>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" title="Menu dinamis backend" />
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoadingMenu && (
            <div className="space-y-2 px-2 py-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 rounded-md bg-slate-200/60 dark:bg-galaxy-border/40 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state if backend returns no menus */}
          {!isLoadingMenu && dynamicMenuTree.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
              Tidak ada menu diizinkan.
            </div>
          )}

          {/* Render dynamic menu tree strictly from Backend */}
          {!isLoadingMenu && dynamicMenuTree.map((menu) => {
            const hasChildren = menu.children && menu.children.length > 0;
            const IconComp = getIconComponent(menu.menuIcon);
            const isOpen = !!openSubmenus[menu.menuName];
            const isDirectActive = isActiveRoute(menu.menuUrl);
            const isChildActive =
              hasChildren &&
              menu.children?.some(
                (child) =>
                  isActiveRoute(child.menuUrl) ||
                  child.children?.some((gc) => isActiveRoute(gc.menuUrl))
              );

            if (hasChildren) {
              return (
                <div key={menu.menuId} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(menu.menuName)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 text-left",
                      isChildActive
                        ? "text-primary-700 dark:text-primary-400 font-semibold bg-primary-500/10 dark:bg-primary-400/15 border-l-2 border-primary-600 dark:border-primary-400"
                        : "text-slate-600 dark:text-galaxy-menuItem hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-galaxy-hover/70 hover:translate-x-0.5",
                      isCollapsed && !mobileOpen && "justify-center px-1"
                    )}
                    title={isCollapsed ? menu.menuTitle : undefined}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <IconComp
                        className={cn(
                          "h-4 w-4 shrink-0 transition-all duration-200",
                          isChildActive
                            ? "text-primary-600 dark:text-primary-400 stroke-[2.2]"
                            : "text-slate-400 dark:text-galaxy-menuTitle group-hover:text-primary-500 dark:group-hover:text-primary-400"
                        )}
                      />
                      {(!isCollapsed || mobileOpen) && (
                        <span className="truncate">{menu.menuTitle}</span>
                      )}
                    </div>

                    {(!isCollapsed || mobileOpen) && (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-slate-400 dark:text-galaxy-menuTitle transition-transform duration-200",
                          isOpen ? "rotate-180 text-primary-600 dark:text-primary-400" : "group-hover:text-slate-600 dark:group-hover:text-white"
                        )}
                      />
                    )}
                  </button>

                  {/* Children Submenu Tree */}
                  {isOpen && (!isCollapsed || mobileOpen) && (
                    <div className="ml-4 pl-3 border-l border-slate-200/80 dark:border-galaxy-border/80 space-y-1.5 py-1">
                      {menu.children?.map((child) => {
                        const hasGrandChildren = child.children && child.children.length > 0;

                        // Case A: Sub-group (e.g. Organisasi, Kepegawaian, etc.)
                        if (hasGrandChildren) {
                          const isSubGroupActive = child.children?.some((gc) => isActiveRoute(gc.menuUrl));
                          const isSubGroupOpen = openSubmenus[child.menuName] ?? true;
                          const ChildIcon = getIconComponent(child.menuIcon);

                          return (
                            <div key={child.menuId} className="space-y-1 pt-1">
                              <button
                                type="button"
                                onClick={() => toggleSubmenu(child.menuName)}
                                className={cn(
                                  "group flex w-full items-center justify-between rounded px-2 py-1 text-[11px] font-semibold tracking-wider text-left transition-all duration-150 uppercase",
                                  isSubGroupActive
                                    ? "text-primary-600 dark:text-primary-400 font-bold"
                                    : "text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                )}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <ChildIcon className="h-3 w-3 shrink-0 opacity-70" />
                                  <span className="truncate">{child.menuTitle}</span>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 transition-transform duration-200 shrink-0",
                                    isSubGroupOpen ? "rotate-180 text-primary-600 dark:text-primary-400" : "opacity-60"
                                  )}
                                />
                              </button>

                              {isSubGroupOpen && (
                                <div className="ml-2 pl-2 border-l border-slate-200/60 dark:border-galaxy-border/60 space-y-0.5">
                                  {child.children?.map((grandChild) => {
                                    const targetUrl = normalizeUrl(grandChild.menuUrl);
                                    const isSubActive = isActiveRoute(grandChild.menuUrl);

                                    return (
                                      <Link
                                        key={grandChild.menuId}
                                        href={targetUrl}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                          "group flex items-center justify-between rounded-md px-2 py-1 text-xs transition-all duration-150",
                                          isSubActive
                                            ? "bg-primary-500/10 text-primary-700 font-semibold dark:bg-primary-400/15 dark:text-primary-400"
                                            : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-galaxy-hover/50 hover:pl-2.5"
                                        )}
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          {isSubActive ? (
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-400 shrink-0" />
                                          ) : (
                                            <span className="h-1 w-1 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 shrink-0 transition-colors" />
                                          )}
                                          <span className="truncate">{grandChild.menuTitle}</span>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Case B: Direct link (e.g. Data Karyawan)
                        const targetUrl = normalizeUrl(child.menuUrl);
                        const isSubActive = isActiveRoute(child.menuUrl);

                        return (
                          <Link
                            key={child.menuId}
                            href={targetUrl}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "group flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-all duration-200",
                              isSubActive
                                ? "bg-primary-500/10 text-primary-700 font-semibold dark:bg-primary-400/15 dark:text-primary-400"
                                : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-galaxy-hover/50 hover:pl-3"
                            )}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              {isSubActive ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-400 shrink-0" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 shrink-0 transition-colors" />
                              )}
                              <span className="truncate">{child.menuTitle}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Standalone Menu (Root with URL)
            const targetUrl = normalizeUrl(menu.menuUrl);
            return (
              <Link
                key={menu.menuId}
                href={targetUrl}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all duration-200",
                  isDirectActive
                    ? "bg-primary-500/10 dark:bg-primary-400/15 text-primary-700 dark:text-primary-400 font-semibold border-l-2 border-primary-600 dark:border-primary-400"
                    : "text-slate-600 dark:text-galaxy-menuItem hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-galaxy-hover/70 hover:translate-x-0.5",
                  isCollapsed && !mobileOpen && "justify-center px-1"
                )}
                title={isCollapsed ? menu.menuTitle : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <IconComp
                    className={cn(
                      "h-4 w-4 shrink-0 transition-all duration-200",
                      isDirectActive
                        ? "text-primary-600 dark:text-primary-400 stroke-[2.2]"
                        : "text-slate-400 dark:text-galaxy-menuTitle group-hover:text-primary-500 dark:group-hover:text-primary-400"
                    )}
                  />
                  {(!isCollapsed || mobileOpen) && (
                    <span className="truncate">{menu.menuTitle}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop Collapse Toggle in Footer */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-slate-100 dark:border-galaxy-border/80 bg-slate-50/50 dark:bg-galaxy-sidebar/80 backdrop-blur-sm">
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-galaxy-menuTitle font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400/70" />
              <span>POS Galaxy Edition</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-primary-400 hover:border-primary-400/40 dark:border-galaxy-border dark:bg-galaxy-card dark:text-slate-300 dark:hover:text-primary-400 dark:hover:bg-galaxy-hover ml-auto transition-all duration-150 hover:shadow-[0_0_10px_rgba(25,224,184,0.25)]"
            title={isCollapsed ? "Perbesar Sidebar" : "Kecilkan Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
