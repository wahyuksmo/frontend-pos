"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface MultiSearchableSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  maxDisplayTags?: number;
  className?: string;
  id?: string;
}

export function MultiSearchableSelect({
  options,
  value = [],
  onChange,
  placeholder = "Pilih beberapa opsi...",
  searchPlaceholder = "Cari opsi...",
  hasError = false,
  disabled = false,
  maxDisplayTags = 2,
  className,
  id,
}: MultiSearchableSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const toggleOption = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const handleSelectAll = () => {
    const allFilteredValues = filteredOptions.map((opt) => opt.value);
    const combined = Array.from(new Set([...value, ...allFilteredValues]));
    onChange(combined);
  };

  const handleClearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange([]);
  };

  const handleRemoveTag = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  const displayedTags = selectedOptions.slice(0, maxDisplayTags);
  const remainingCount = selectedOptions.length - maxDisplayTags;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full text-left", className)}
    >
      {/* Trigger Button */}
      <div
        id={selectId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "flex min-h-[40px] w-full items-center justify-between rounded-lg border bg-white px-3 py-1.5 transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-galaxy-input dark:text-slate-100",
          hasError
            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-300 focus:border-primary-400 focus:ring-primary-400/20 dark:border-galaxy-border dark:focus:border-primary-400",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 pr-1">
          {selectedOptions.length === 0 ? (
            <span className="text-sm text-slate-400 dark:text-slate-500">
              {placeholder}
            </span>
          ) : (
            <>
              {displayedTags.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 border border-primary-200/80 dark:bg-primary-950/60 dark:text-primary-300 dark:border-primary-800/80"
                >
                  <span className="truncate max-w-[140px]">{opt.label}</span>
                  {!disabled && (
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => handleRemoveTag(e, opt.value)}
                      className="text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200 dark:bg-galaxy-card dark:text-slate-300 dark:border-galaxy-border">
                  +{remainingCount} lainnya
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          {selectedOptions.length > 0 && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              title="Hapus semua pilihan"
              onClick={handleClearAll}
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180 text-primary-400"
            )}
          />
        </div>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-72 w-full rounded-lg border border-slate-200 bg-white py-1.5 shadow-xl dark:border-galaxy-border dark:bg-galaxy-card backdrop-blur-md animate-in fade-in-50 zoom-in-95">
          {/* Search Input */}
          <div className="px-2 pb-1.5 pt-0.5 border-b border-slate-100 dark:border-galaxy-border/50">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
            {/* Quick Action buttons */}
            <div className="mt-1.5 flex items-center justify-between px-0.5 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-mono">
                {selectedOptions.length} terpilih
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Pilih Semua
                </button>
                <span className="text-slate-300 dark:text-galaxy-border">|</span>
                <button
                  type="button"
                  onClick={() => handleClearAll()}
                  className="font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* List Options */}
          <ul className="max-h-48 overflow-y-auto p-1 text-sm focus:outline-none space-y-0.5">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-slate-400">
                Tidak ada opsi yang cocok
              </li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <li
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                      isSelected
                        ? "bg-primary-50/70 text-primary-950 dark:bg-primary-950/40 dark:text-primary-100"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-galaxy-card/80"
                    )}
                  >
                    {/* Visual Checkbox */}
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected
                          ? "border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500"
                          : "border-slate-300 bg-white dark:border-galaxy-border dark:bg-galaxy-input"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate flex items-center gap-1.5">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                      {opt.description && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
