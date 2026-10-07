"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Sortable from "sortablejs";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Folder,
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeAlert } from "@/lib/sweetalert";
import { menusService } from "@/services";
import type { Menu } from "@/types";

interface MenuTreeSortableProps {
  menus: Menu[];
  loading: boolean;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string, name: string) => void;
  onCreateChild: (parent: Menu) => void;
  onRefresh: () => void;
}

interface SortableNode extends Menu {
  childrenNodes: SortableNode[];
}

export function MenuTreeSortable({
  menus,
  loading,
  onEdit,
  onDelete,
  onCreateChild,
  onRefresh,
}: MenuTreeSortableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Build tree from flat menus
  const initialTree = useMemo(() => {
    const map = new Map<string, SortableNode>();
    menus.forEach((m) => {
      map.set(m.menuId, { ...m, childrenNodes: [] });
    });

    const roots: SortableNode[] = [];
    menus.forEach((m) => {
      const node = map.get(m.menuId)!;
      if (m.pid && map.has(m.pid)) {
        map.get(m.pid)!.childrenNodes.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort by menuPosition
    const sortNodes = (nodes: SortableNode[]) => {
      nodes.sort((a, b) => (a.menuPosition || 0) - (b.menuPosition || 0));
      nodes.forEach((n) => sortNodes(n.childrenNodes));
    };
    sortNodes(roots);

    return roots;
  }, [menus]);

  const [treeData, setTreeData] = useState<SortableNode[]>(initialTree);

  useEffect(() => {
    setTreeData(initialTree);
    setIsDirty(false);
  }, [initialTree]);

  // Initialize nested sortables with handles
  useEffect(() => {
    if (!containerRef.current) return;

    const sortableInstances: Sortable[] = [];
    const elements = containerRef.current.querySelectorAll<HTMLElement>(".nested-sortable-handle");

    elements.forEach((el) => {
      const sortable = new Sortable(el, {
        group: "nested-menu",
        handle: ".handle",
        animation: 180,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",
        onEnd: () => {
          setIsDirty(true);
        },
      });
      sortableInstances.push(sortable);
    });

    return () => {
      sortableInstances.forEach((s) => s.destroy());
    };
  }, [treeData]);

  const toggleCollapse = (menuId: string) => {
    setCollapsedMap((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const expandAll = () => setCollapsedMap({});
  const collapseAll = () => {
    const map: Record<string, boolean> = {};
    menus.forEach((m) => {
      map[m.menuId] = true;
    });
    setCollapsedMap(map);
  };


  // Traverse DOM to extract new hierarchy and positions
  const handleSaveOrder = async () => {
    if (!containerRef.current) return;

    setSaving(true);
    showLoadingAlert("Menyimpan Urutan...", "Menyinkronkan posisi dan hierarki menu ke server...");

    try {
      const updates: Array<{ menuId: string; pid: string | null; menuPosition: number }> = [];

      const parseContainer = (container: Element, parentId: string | null) => {
        const itemEls = Array.from(container.children).filter((c) =>
          c.classList.contains("list-group-item")
        );

        itemEls.forEach((itemEl, idx) => {
          const menuId = itemEl.getAttribute("data-menu-id");
          if (menuId) {
            updates.push({
              menuId,
              pid: parentId,
              menuPosition: idx + 1,
            });

            // Find child nested container
            const childContainer = itemEl.querySelector(":scope > .nested-sortable-handle");
            if (childContainer) {
              parseContainer(childContainer, menuId);
            }
          }
        });
      };

      const rootContainer = containerRef.current.querySelector(".root-sortable-container");
      if (rootContainer) {
        parseContainer(rootContainer, null);
      }

      // Execute updates concurrently in batches
      await Promise.all(
        updates.map((u) =>
          menusService.update(u.menuId, {
            pid: u.pid,
            menuPosition: u.menuPosition,
          })
        )
      );

      closeAlert();
      await showSuccessAlert(
        "Urutan Berhasil Disimpan!",
        "Struktur dan urutan posisi menu telah diperbarui secara permanen."
      );
      setIsDirty(false);
      onRefresh();
    } catch (err: any) {
      closeAlert();
      showErrorAlert("Gagal Menyimpan Urutan", err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const renderNode = (node: SortableNode, level: number = 1) => {
    const hasChildren = node.childrenNodes.length > 0;
    const isCollapsed = collapsedMap[node.menuId];

    return (
      <div
        key={node.menuId}
        data-menu-id={node.menuId}
        className={`list-group-item nested-${level} mb-2 rounded-lg border border-slate-200/80 bg-white/70 p-3 shadow-xs dark:border-galaxy-border/80 dark:bg-slate-900/60 backdrop-blur-xs transition-all`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left section: Handle, Expand Toggle, Icon, Title */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Drag Handle */}
            <div
              className="handle flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-primary-400 dark:hover:bg-slate-800 transition-colors"
              title="Seret untuk memindahkan / mengubah urutan"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            {/* Expand / Collapse Button */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(node.menuId);
                }}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                title={isCollapsed ? "Buka Submenu" : "Tutup Submenu"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-6" />
            )}

            {/* Folder / File Icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-400/10 text-primary-400 border border-primary-400/20">
              {hasChildren ? (
                <Folder className="h-4 w-4 fill-primary-400/20 text-primary-400" />
              ) : (
                <FileText className="h-4 w-4 text-primary-400" />
              )}
            </div>

            {/* Menu Details */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-heading">
                  {node.menuTitle}
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {node.menuName}
                </span>
                <Badge variant={level === 1 ? "primary" : "outline"} className="text-[10px] py-0 px-1.5">
                  Lvl {level}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                <span>URL: {node.menuUrl || "-"}</span>
                <span>•</span>
                <span>Icon: {node.menuIcon || "-"}</span>
              </div>
            </div>
          </div>

          {/* Right section: Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCreateChild(node)}
              className="h-7 px-2 text-[11px] gap-1 text-primary-400 hover:border-primary-400/40"
              title="Tambah Submenu di bawah menu ini"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">Submenu</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(node)}
              className="h-7 w-7 p-0 text-slate-400 hover:text-primary-400"
              title="Edit Menu"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(node.menuId, node.menuTitle)}
              className="h-7 w-7 p-0 text-slate-400 hover:text-danger-500"
              title="Hapus Menu"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Children Sub-list (Sortable container) */}
        {hasChildren && (
          <div
            style={{ display: isCollapsed ? "none" : undefined }}
            className={`nested-list nested-sortable-handle pl-6 pt-2 border-l-2 border-dashed border-primary-400/20 ml-5 mt-2 ${
              isCollapsed ? "hidden is-collapsed" : ""
            }`}
            data-parent-id={node.menuId}
          >
            {node.childrenNodes.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-slate-200/80 dark:border-galaxy-border/80 shadow-galaxy">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-galaxy-border/50 pb-4">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary-400" />
            <span>Nested Sortables List with Handle - Struktur Navigasi Menu</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Gunakan pegangan handle <span className="font-mono text-primary-400">::</span> untuk memindahkan posisi dan tingkat hierarki menu.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={expandAll} className="text-xs">
            Buka Semua
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs">
            Tutup Semua
          </Button>
          {isDirty && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTreeData(initialTree);
                setIsDirty(false);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveOrder}
            isLoading={saving}
            disabled={!isDirty}
            className="text-xs gap-1.5 shadow-galaxy-cyan"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Urutan Menu</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div ref={containerRef}>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : treeData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Belum ada menu terdaftar. Silakan klik tambah menu baru.
            </div>
          ) : (
            <div className="nested-list nested-sortable-handle root-sortable-container">
              {treeData.map((rootNode) => renderNode(rootNode, 1))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
