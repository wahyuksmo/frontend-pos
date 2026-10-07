"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types";

export interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari opsi...",
  hasError = false,
  disabled = false,
  clearable = true,
  size = "md",
  className,
  id,
}: SearchableSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

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
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value);
        setIsOpen(false);
      }
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full text-left", className)}
      onKeyDown={handleKeyDown}
    >
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-galaxy-input dark:text-slate-100",
          size === "sm" ? "h-9 text-xs px-3 py-1.5" : "h-10 text-sm px-3 py-2",
          hasError
            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-300 focus:border-primary-400 focus:ring-primary-400/20 dark:border-galaxy-border dark:focus:border-primary-400",
          !selectedOption && "text-slate-400 dark:text-slate-500"
        )}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.icon}
              <span className="text-slate-800 dark:text-slate-200">
                {selectedOption.label}
              </span>
            </>
          ) : (
            placeholder
          )}
        </span>

        <div className="flex items-center gap-1.5 text-slate-400">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="p-0.5 hover:text-slate-600 dark:hover:text-slate-200 rounded"
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
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-galaxy-border dark:bg-galaxy-card backdrop-blur-md animate-in fade-in-50 zoom-in-95">
          {/* Internal search input */}
          <div className="px-2 pb-1.5 pt-1 border-b border-slate-100 dark:border-galaxy-border/50">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:outline-none dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <ul
            ref={listRef}
            className="max-h-44 overflow-y-auto p-1 text-sm focus:outline-none"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-slate-400">
                Tidak ada opsi yang cocok
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors",
                      isHighlighted &&
                        "bg-primary-50 text-primary-900 dark:bg-primary-950/60 dark:text-primary-300",
                      isSelected &&
                        !isHighlighted &&
                        "font-semibold text-primary-600 dark:text-primary-400",
                      !isSelected && !isHighlighted && "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon}
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                    )}
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
