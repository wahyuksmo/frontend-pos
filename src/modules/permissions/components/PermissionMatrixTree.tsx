"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Sortable from "sortablejs";
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Eye,
  PlusCircle,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  GripVertical,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Menu, UserGroup } from "@/types";
import type { PermKey, PermissionsRowData } from "./PermissionMatrixTable";

export interface PermissionMatrixTreeProps {
  menus: Menu[];
  selectedGroup?: UserGroup;
  matrix: Record<string, PermissionsRowData>;
  loading: boolean;
  onToggle: (menuId: string, perm: PermKey) => void;
  onToggleRow: (menuId: string, enableAll: boolean) => void;
  onToggleBatch?: (menuIds: string[], enableAll: boolean) => void;
}

interface TreeNode extends Menu {
  childrenNodes: TreeNode[];
}

export function PermissionMatrixTree({
  menus,
  selectedGroup,
  matrix,
  loading,
  onToggle,
  onToggleRow,
  onToggleBatch,
}: PermissionMatrixTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const permColumns: Array<{ key: PermKey; label: string; short: string; icon: React.ReactNode }> = [
    { key: "readPerm", label: "Lihat (Read)", short: "READ", icon: <Eye className="h-3 w-3" /> },
    { key: "createPerm", label: "Tambah (Create)", short: "CREATE", icon: <PlusCircle className="h-3 w-3" /> },
    { key: "updatePerm", label: "Ubah (Update)", short: "UPDATE", icon: <Edit className="h-3 w-3" /> },
    { key: "deletePerm", label: "Hapus (Delete)", short: "DELETE", icon: <Trash2 className="h-3 w-3" /> },
    { key: "exportPerm", label: "Ekspor (Export)", short: "EXPORT", icon: <Download className="h-3 w-3" /> },
    { key: "importPerm", label: "Impor (Import)", short: "IMPORT", icon: <Upload className="h-3 w-3" /> },
  ];

  // Build hierarchical tree
  const treeRoots: TreeNode[] = useMemo(() => {
    const map = new Map<string, TreeNode>();

    menus.forEach((m) => {
      map.set(m.menuId, { ...m, childrenNodes: [] });
    });

    const roots: TreeNode[] = [];

    menus.forEach((m) => {
      const node = map.get(m.menuId)!;
      if (m.pid && map.has(m.pid)) {
        map.get(m.pid)!.childrenNodes.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => (a.menuPosition || 0) - (b.menuPosition || 0));
      nodes.forEach((n) => sortNodes(n.childrenNodes));
    };
    sortNodes(roots);

    return roots;
  }, [menus]);

  // Initialize sortablejs drag and drop on nested containers
  useEffect(() => {
    if (!containerRef.current) return;

    const sortableInstances: Sortable[] = [];
    const elements = containerRef.current.querySelectorAll<HTMLElement>(".nested-sortable-handle");

    elements.forEach((el) => {
      const sortable = new Sortable(el, {
        group: "nested-matrix",
        handle: ".handle",
        animation: 160,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",
      });
      sortableInstances.push(sortable);
    });

    return () => {
      sortableInstances.forEach((s) => s.destroy());
    };
  }, [treeRoots]);

  const toggleCollapse = (menuId: string) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedMap({});
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    menus.forEach((m) => {
      allCollapsed[m.menuId] = true;
    });
    setCollapsedMap(allCollapsed);
  };

  // Collect all menuIds in a subtree
  const collectSubtreeIds = (node: TreeNode): string[] => {
    let ids = [node.menuId];
    node.childrenNodes.forEach((child) => {
      ids = ids.concat(collectSubtreeIds(child));
    });
    return ids;
  };

  const handleToggleSubtree = (node: TreeNode, enableAll: boolean) => {
    const subtreeIds = collectSubtreeIds(node);
    if (onToggleBatch) {
      onToggleBatch(subtreeIds, enableAll);
    } else {
      subtreeIds.forEach((id) => onToggleRow(id, enableAll));
    }
  };

  const renderNode = (node: TreeNode, level: number = 1) => {
    const hasChildren = node.childrenNodes.length > 0;
    const isCollapsed = collapsedMap[node.menuId];

    const rowPerms = matrix[node.menuId] || {
      readPerm: "N",
      createPerm: "N",
      updatePerm: "N",
      deletePerm: "N",
      exportPerm: "N",
      importPerm: "N",
    };

    const isAllChecked = permColumns.every((col) => rowPerms[col.key] === "Y");

    return (
      <div
        key={node.menuId}
        data-menu-id={node.menuId}
        className={`list-group-item nested-${level} mb-2.5 rounded-lg border border-slate-200/80 bg-white/80 p-3 shadow-xs dark:border-galaxy-border/80 dark:bg-slate-900/60 backdrop-blur-xs transition-all`}
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left: Handle, Collapse toggle, Icon, Menu Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Drag Handle */}
            <div
              className="handle flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-primary-400 dark:hover:bg-slate-800 transition-colors"
              title="Seret handle untuk mengatur susunan tree"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(node.menuId);
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-primary-400 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-300 dark:hover:bg-galaxy-hover transition-colors cursor-pointer"
                title={isCollapsed ? "Buka Subtree" : "Tutup Subtree"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <div className="w-7 h-7 shrink-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
            )}

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-400/10 text-primary-400 border border-primary-400/20">
              {hasChildren ? (
                isCollapsed ? (
                  <Folder className="h-4 w-4" />
                ) : (
                  <FolderOpen className="h-4 w-4 text-primary-400" />
                )
              ) : (
                <FileText className="h-4 w-4 text-slate-400 dark:text-slate-300" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
                  {node.menuTitle}
                </span>
                <span className="font-mono text-[10px] text-primary-400 bg-primary-400/10 px-1.5 py-0.5 rounded border border-primary-400/20">
                  {node.menuName}
                </span>
                <Badge variant={level === 1 ? "primary" : "outline"} className="text-[10px] py-0 px-1.5">
                  Lvl {level}
                </Badge>
                {node.menuUrl && (
                  <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                    {node.menuUrl}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {hasChildren
                  ? `${node.childrenNodes.length} Submenu turunan terhubung`
                  : "Modul eksekusi akhir"}
              </p>
            </div>
          </div>

          {/* Right: Permission Checklist & Row Actions */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {permColumns.map((col) => {
              const isChecked = rowPerms[col.key] === "Y";

              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => onToggle(node.menuId, col.key)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    isChecked
                      ? "bg-primary-400 text-slate-950 font-bold shadow-sm shadow-primary-400/30"
                      : "border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-500 dark:hover:bg-galaxy-hover"
                  }`}
                  title={`${col.label} untuk ${node.menuTitle}: ${isChecked ? "Aktif" : "Non-Aktif"}`}
                >
                  {col.icon}
                  <span className="text-[10px] uppercase font-mono">{col.short}</span>
                </button>
              );
            })}

            {/* Quick Row/Branch Toggle */}
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200 dark:border-galaxy-border">
              <button
                type="button"
                onClick={() => onToggleRow(node.menuId, !isAllChecked)}
                className="px-2 py-1 rounded text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-primary-400 dark:text-slate-300 dark:hover:bg-galaxy-input transition-colors"
                title="Aktifkan/Non-aktifkan semua izin baris ini"
              >
                {isAllChecked ? "Reset Baris" : "Semua Izin"}
              </button>

              {hasChildren && (
                <button
                  type="button"
                  onClick={() => handleToggleSubtree(node, !isAllChecked)}
                  className="px-2 py-1 rounded text-[11px] font-semibold text-primary-400 bg-primary-400/10 hover:bg-primary-400/20 border border-primary-400/20 transition-colors"
                  title="Terapkan status izin ke seluruh cabang submenu di bawahnya"
                >
                  Semua Cabang
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Children Sub-list */}
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
            <span>Nested Sortables List with Handle - Matriks Tree Hak Akses</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Role Target:{" "}
            <span className="font-semibold text-primary-400">
              {selectedGroup ? `${selectedGroup.usergroupName} (${selectedGroup.usergroupCode})` : "Memuat..."}
            </span>
            . Seret handle <span className="font-mono text-primary-400">::</span> untuk menyusun posisi tree.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExpandAll} className="text-xs">
            Buka Semua Cabang
          </Button>
          <Button variant="outline" size="sm" onClick={handleCollapseAll} className="text-xs">
            Tutup Semua Cabang
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div ref={containerRef}>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : treeRoots.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada menu terdaftar dalam sistem.
            </div>
          ) : (
            <div className="nested-list nested-sortable-handle root-sortable-container">
              {treeRoots.map((rootNode) => renderNode(rootNode, 1))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
