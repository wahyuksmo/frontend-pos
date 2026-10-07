"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FolderTree, Table2 } from "lucide-react";
import { PageTitleBox } from "@/components/layout/PageTitleBox";
import {
  MenuFilter,
  MenuTable,
  MenuModal,
  MenuTreeSortable,
  MenuModalFormData,
} from "@/modules/menus";
import { menusService } from "@/services";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
  showLoadingAlert,
  closeAlert,
} from "@/lib/sweetalert";
import { cn } from "@/lib/utils";
import type { Menu, PaginationMeta } from "@/types";

export default function MenusManagementPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);

  // Server-side query state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedParent, setSelectedParent] = useState("");

  // View mode switcher: flat table vs nested sortables tree
  const [activeView, setActiveView] = useState<"table" | "tree">("table");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>();

  // Load all menus for parent references & stats
  const fetchAllMenus = async () => {
    try {
      const res = await menusService.findAll({ limit: 1000 });
      setAllMenus(res.data || []);
    } catch {
      // Silently ignore secondary fetch errors
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menusService.findAll({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        pid: selectedParent || undefined,
      });
      setMenus(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorAlert("Gagal Memuat Menu", err.message || "Terjadi kesalahan memuat menu.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, selectedParent]);

  useEffect(() => {
    fetchAllMenus();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rootMenus = allMenus.filter((m) => !m.pid);
  const subMenuCount = allMenus.length - rootMenus.length;

  const handleOpenCreate = () => {
    setSelectedMenu(null);
    setDefaultParentId(undefined);
    setIsModalOpen(true);
  };

  const handleCreateChild = (parent: Menu) => {
    setSelectedMenu(null);
    setDefaultParentId(parent.menuId);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setDefaultParentId(undefined);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (formData: MenuModalFormData) => {
    if (!formData.menuTitle.trim()) {
      showErrorAlert("Validasi Gagal", "Judul Menu wajib diisi.");
      return;
    }

    if (selectedMenu) {
      // Update
      showLoadingAlert("Memperbarui...", "Menyimpan perubahan struktur menu...");
      try {
        await menusService.update(selectedMenu.menuId, {
          pid: formData.pid || null,
          menuTitle: formData.menuTitle,
          menuIcon: formData.menuIcon,
          menuUrl: formData.menuUrl || null,
          menuPosition: Number(formData.menuPosition),
        });
        closeAlert();
        await showSuccessAlert("Berhasil!", "Menu berhasil diperbarui.");
        fetchData();
        fetchAllMenus();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Memperbarui", err.message || "Gagal memperbarui menu.");
        throw err;
      }
    } else {
      // Create
      if (!formData.menuName.trim()) {
        showErrorAlert("Validasi Gagal", "Kode Menu wajib diisi.");
        return;
      }
      showLoadingAlert("Menyimpan...", "Menambahkan item menu baru...");
      try {
        await menusService.create({
          ...formData,
          pid: formData.pid || null,
          menuUrl: formData.menuUrl || null,
        });
        closeAlert();
        await showSuccessAlert("Berhasil!", "Menu baru berhasil didaftarkan.");
        fetchData();
        fetchAllMenus();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Menyimpan", err.message || "Gagal membuat menu.");
        throw err;
      }
    }
  };

  const handleDelete = async (menu: Menu) => {
    const confirm = await showConfirmDialog({
      title: "Hapus Menu?",
      text: `Apakah Anda yakin ingin menghapus menu '${menu.menuTitle}'? Semua hak akses terkait menu ini juga akan terhapus.`,
      isDanger: true,
    });

    if (confirm.isConfirmed) {
      showLoadingAlert("Menghapus...", "Sedang menghapus menu...");
      try {
        await menusService.delete(menu.menuId);
        closeAlert();
        await showSuccessAlert("Dihapus!", `Menu '${menu.menuTitle}' telah dihapus.`);
        fetchData();
        fetchAllMenus();
      } catch (err: any) {
        closeAlert();
        showErrorAlert("Gagal Menghapus", err.message || "Gagal menghapus menu.");
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ["Menu ID,Kode Menu,Judul Menu,Menu Induk,URL Path,Urutan"];
    const rows = menus.map((m) =>
      `"${m.menuId}","${m.menuName}","${m.menuTitle}","${m.pid || ""}","${m.menuUrl || ""}","${m.menuPosition || 1}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `menus_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <PageTitleBox title="Manajemen Struktur Menu" category="Sistem & Pengaturan" />

      {/* View Mode Switcher: Velzon Galaxy Segmented Tab */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white p-1.5 shadow-sm dark:border-galaxy-border/80 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setActiveView("table")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all",
              activeView === "table"
                ? "bg-primary-400 text-slate-950 font-bold shadow-galaxy-cyan"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Table2 className="h-3.5 w-3.5" />
            <span>Tampilan Tabel Grid (Datatable)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("tree")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all",
              activeView === "tree"
                ? "bg-primary-400 text-slate-950 font-bold shadow-galaxy-cyan"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <FolderTree className="h-3.5 w-3.5" />
            <span>Tampilan Nested Sortables Tree (Drag & Drop)</span>
          </button>
        </div>
      </div>

      {activeView === "table" ? (
        <>
          {/* Card 1: Filter Parameter */}
          <MenuFilter
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            selectedParent={selectedParent}
            onParentChange={(val) => {
              setSelectedParent(val);
              setPage(1);
            }}
            onReset={() => {
              setSearch("");
              setSelectedParent("");
              setPage(1);
            }}
            rootMenus={rootMenus}
          />

          {/* Card 2: Server-Side Menu Table */}
          <MenuTable
            menus={menus}
            allMenus={allMenus}
            loading={loading}
            meta={meta}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            onCreateOpen={handleOpenCreate}
            onEditOpen={handleOpenEdit}
            onDelete={handleDelete}
            onExport={handleExportCSV}
          />
        </>
      ) : (
        /* Card 2 (Alternate): Nested Sortables List with Handle */
        <MenuTreeSortable
          menus={allMenus}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={(id, name) => {
            const found = allMenus.find((m) => m.menuId === id);
            if (found) handleDelete(found);
          }}
          onCreateChild={handleCreateChild}
          onRefresh={() => {
            fetchData();
            fetchAllMenus();
          }}
        />
      )}

      {/* Create / Edit Modal */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        menu={selectedMenu}
        rootMenus={rootMenus}
        defaultPid={defaultParentId}
      />
    </div>
  );
}

