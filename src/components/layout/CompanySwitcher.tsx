"use client";

import React, { useState, useEffect, useRef } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { apiClient, tokenStorage } from "@/services/api-client";

interface Company {
  companyId: string;
  companyCode: string;
  companyName: string;
}

export function CompanySwitcher() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load active company from storage
    const currentId = tokenStorage.getActiveCompany();
    if (currentId) {
      setActiveCompanyId(currentId);
    }

    // Fetch available companies
    apiClient
      .get<{ data: Company[] }>("/masters/companies")
      .then((res) => {
        const list = res.data || [];
        setCompanies(list);
        if (list.length > 0) {
          if (!currentId || !list.some((c) => c.companyId === currentId)) {
            const defaultId = list[0].companyId;
            setActiveCompanyId(defaultId);
            tokenStorage.setActiveCompany(defaultId);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCompany = companies.find((c) => c.companyId === activeCompanyId);

  const handleSelect = (companyId: string) => {
    if (companyId === activeCompanyId) {
      setIsOpen(false);
      return;
    }
    setActiveCompanyId(companyId);
    tokenStorage.setActiveCompany(companyId);
    setIsOpen(false);
    window.location.reload();
  };

  if (companies.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-200 dark:hover:bg-galaxy-hover transition-colors"
        title="Pilih Perusahaan Active"
      >
        <Building2 className="h-4 w-4 text-primary-400" />
        <span className="max-w-[140px] truncate">
          {selectedCompany ? selectedCompany.companyName : "Pilih Perusahaan"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-galaxy-border dark:bg-galaxy-card z-50 animate-in fade-in-50 zoom-in-95">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-galaxy-border/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Switch Company
          </div>
          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {companies.map((c) => {
              const isSelected = c.companyId === activeCompanyId;
              return (
                <button
                  key={c.companyId}
                  type="button"
                  onClick={() => handleSelect(c.companyId)}
                  className={`flex w-full items-center justify-between px-2.5 py-2 text-xs rounded transition-colors text-left ${
                    isSelected
                      ? "bg-primary-500/10 text-primary-400 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-galaxy-hover"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate font-medium">{c.companyName}</div>
                    <div className="text-[10px] text-slate-400">{c.companyCode}</div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

