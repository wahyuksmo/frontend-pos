"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Layers, LayoutGrid, Link as LinkIcon, Hash, Tag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormGroup } from "@/components/forms/FormGroup";
import { FormInput } from "@/components/forms/FormInput";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import type { Menu, SelectOption } from "@/types";

export interface MenuModalFormData {
  pid: string;
  menuName: string;
  menuTitle: string;
  menuIcon: string;
  menuUrl: string;
  menuPosition: number;
}

export interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuModalFormData) => Promise<void>;
  menu?: Menu | null;
  rootMenus: Menu[];
  defaultPid?: string;
}

export function MenuModal({ isOpen, onClose, onSubmit, menu, rootMenus, defaultPid }: MenuModalProps) {
  const isEditing = Boolean(menu);
  const [formData, setFormData] = useState<MenuModalFormData>({
    pid: defaultPid || "",
    menuName: "",
    menuTitle: "",
    menuIcon: "Layers",
    menuUrl: "",
    menuPosition: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (menu) {
      setFormData({
        pid: menu.pid || "",
        menuName: menu.menuName,
        menuTitle: menu.menuTitle,
        menuIcon: menu.menuIcon || "Layers",
        menuUrl: menu.menuUrl || "",
        menuPosition: menu.menuPosition || 1,
      });
    } else {
      setFormData({
        pid: defaultPid || "",
        menuName: "",
        menuTitle: "",
        menuIcon: "Layers",
        menuUrl: "",
        menuPosition: 1,
      });
    }
  }, [menu, defaultPid, isOpen]);

  // Options for Parent Menu (Select2)
  const parentOptions: SelectOption[] = useMemo(() => [
    { value: "", label: "-- Menu Utama (Root / Top Level) --" },
    ...rootMenus
      .filter((r) => r.menuId !== menu?.menuId)
      .map((r) => ({
        value: r.menuId,
        label: `${r.menuTitle} (${r.menuName})`,
      })),
  ], [rootMenus, menu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Menu: ${menu?.menuTitle}` : "Tambah Modul Menu Baru"}
      description="Konfigurasi hirarki menu navigasi dan routing halaman sistem."
      maxWidth="2xl"
      onSubmit={handleSubmit}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
            disabled={submitting}
          >
            {isEditing ? "Simpan Perubahan" : "Simpan Menu"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Dynamic Menu Preview Card */}
        <div className="flex items-center gap-3.5 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-galaxy-border/70 dark:bg-galaxy-input/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-400/15 text-primary-400 font-semibold text-xs ring-2 ring-primary-400/25">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate font-heading">
              {formData.menuTitle || "Judul Modul Menu"}
            </h4>
            <p className="text-[11px] text-primary-400 font-mono">
              {formData.menuName || "KODE_MENU"} • {formData.menuUrl || "/url-path"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Menu Induk using Select2 */}
          <div className="sm:col-span-2">
            <FormGroup
              label="Menu Induk (Parent)"
              helperText="Pilih menu utama jika menu ini merupakan submenu / turunan"
            >
              <SearchableSelect
                options={parentOptions}
                value={formData.pid}
                onChange={(val) => setFormData({ ...formData, pid: val })}
                placeholder="Pilih Menu Induk..."
                searchPlaceholder="Cari menu induk..."
                clearable={false}
              />
            </FormGroup>
          </div>

          <FormGroup
            label="Kode Menu (Huruf Besar & Unik)"
            required={!isEditing}
            helperText="Identifier izin modul (cth: MASTER_PRODUCTS)"
          >
            <FormInput
              placeholder="MASTER_PRODUCTS"
              leftIcon={<Tag className="h-4 w-4" />}
              value={formData.menuName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  menuName: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                })
              }
              disabled={isEditing}
              className={isEditing ? "opacity-60 bg-slate-100 font-mono dark:bg-galaxy-input" : "font-mono"}
            />
          </FormGroup>

          <FormGroup
            label="Judul Tampilan Menu"
            required
            helperText="Label teks yang muncul pada sidebar"
          >
            <FormInput
              placeholder="cth: Katalog Produk"
              leftIcon={<Layers className="h-4 w-4" />}
              value={formData.menuTitle}
              onChange={(e) => setFormData({ ...formData, menuTitle: e.target.value })}
            />
          </FormGroup>

          <FormGroup
            label="URL Path Halaman"
            helperText="Rute halaman Next.js (cth: /products)"
          >
            <FormInput
              placeholder="/products"
              leftIcon={<LinkIcon className="h-4 w-4" />}
              value={formData.menuUrl}
              onChange={(e) => setFormData({ ...formData, menuUrl: e.target.value })}
            />
          </FormGroup>

          <FormGroup
            label="Nomor Urutan Tampilan"
            helperText="Urutan posisi di sidebar (1, 2, 3...)"
          >
            <FormInput
              type="number"
              min={1}
              leftIcon={<Hash className="h-4 w-4" />}
              value={formData.menuPosition}
              onChange={(e) =>
                setFormData({ ...formData, menuPosition: parseInt(e.target.value) || 1 })
              }
            />
          </FormGroup>
        </div>
      </div>
    </Modal>
  );
}
