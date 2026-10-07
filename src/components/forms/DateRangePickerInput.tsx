"use client";

import React, { useState, useRef, useEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface DateRangePickerInputProps {
  startDate: string; // ISO date format YYYY-MM-DD
  endDate: string; // ISO date format YYYY-MM-DD
  onChange: (startDate: string, endDate: string, preset?: string) => void;
  activePreset?: string;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

export function DateRangePickerInput({
  startDate,
  endDate,
  onChange,
  activePreset,
  placeholder = "Pilih rentang tanggal...",
  hasError = false,
  disabled = false,
  size = "sm",
  className,
  id,
}: DateRangePickerInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // Temporary selection state during popup interaction
  const [tempStart, setTempStart] = useState<string>(startDate || "");
  const [tempEnd, setTempEnd] = useState<string>(endDate || "");
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectionStep, setSelectionStep] = useState<"start" | "end">("start");

  // Calendar month navigation
  const baseDate = startDate ? new Date(startDate + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(
    isNaN(baseDate.getFullYear()) ? new Date().getFullYear() : baseDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    isNaN(baseDate.getMonth()) ? new Date().getMonth() : baseDate.getMonth()
  );

  // Sync temp dates when props change or when opened
  useEffect(() => {
    if (isOpen) {
      setTempStart(startDate || "");
      setTempEnd(endDate || "");
      setSelectionStep(startDate && !endDate ? "end" : "start");
      if (startDate) {
        const d = new Date(startDate + "T00:00:00");
        if (!isNaN(d.getTime())) {
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
        }
      }
    }
  }, [isOpen, startDate, endDate]);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const calendarHeight = 400;
    const calendarWidth = 340; // width for popup
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUp = spaceBelow < calendarHeight && spaceAbove > spaceBelow;

    let left = rect.left;
    if (left + calendarWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - calendarWidth - 12);
    }

    setCoords({
      top: openUp ? Math.max(10, rect.top - calendarHeight - 6) : rect.bottom + 6,
      left,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (dateStr: string) => {
    if (selectionStep === "start" || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd("");
      setSelectionStep("end");
    } else {
      // Step is end
      if (dateStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
      setSelectionStep("start");
    }
  };

  const handlePreset = (preset: string) => {
    const today = new Date();
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
    let s = "";
    let e = "";

    if (preset === "today") {
      s = toDateStr(today);
      e = toDateStr(today);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      s = toDateStr(y);
      e = toDateStr(y);
    } else if (preset === "7d") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      s = toDateStr(past);
      e = toDateStr(today);
    } else if (preset === "30d") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      s = toDateStr(past);
      e = toDateStr(today);
    } else if (preset === "month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      s = toDateStr(startOfMonth);
      e = toDateStr(today);
    } else if (preset === "all") {
      s = "";
      e = "";
    }

    setTempStart(s);
    setTempEnd(e);
    onChange(s, e, preset);
    setIsOpen(false);
  };

  const handleApply = () => {
    onChange(tempStart, tempEnd, "custom");
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStart("");
    setTempEnd("");
    onChange("", "", "all");
    setIsOpen(false);
  };

  // Formatted Label for trigger
  const formatDateDisplay = (isoStr: string) => {
    if (!isoStr) return "";
    const d = new Date(isoStr + "T00:00:00");
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const displayText =
    startDate && endDate
      ? `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
      : startDate
      ? `${formatDateDisplay(startDate)} - Pilih akhir`
      : placeholder;

  const presetsList = [
    { id: "today", label: "Hari Ini" },
    { id: "yesterday", label: "Kemarin" },
    { id: "7d", label: "7 Hari Terakhir" },
    { id: "30d", label: "30 Hari Terakhir" },
    { id: "month", label: "Bulan Ini" },
    { id: "all", label: "Semua Data" },
  ];

  return (
    <div ref={containerRef} className={cn("relative w-full text-left", className)}>
      <div className="relative flex items-center">
        <button
          ref={buttonRef}
          id={inputId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border bg-white px-3 font-mono text-xs transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-galaxy-border dark:bg-galaxy-input dark:text-slate-100",
            size === "sm" ? "h-9" : "h-10",
            hasError
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-300",
            !startDate && "text-slate-400 dark:text-slate-500"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-3.5 w-3.5 text-primary-400 shrink-0" />
            <span className="truncate">{displayText}</span>
          </span>

          {startDate && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded shrink-0 ml-1.5"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </div>

      {isOpen && coords && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="w-[340px] rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xl dark:border-galaxy-border dark:bg-galaxy-card backdrop-blur-md animate-in fade-in-50 zoom-in-95 text-xs select-none"
          >
            {/* Quick Presets Bar */}
            <div className="flex flex-wrap gap-1 pb-3 mb-2 border-b border-slate-100 dark:border-galaxy-border/80">
              {presetsList.map((p) => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePreset(p.id)}
                    className={cn(
                      "px-2 py-1 rounded text-2xs font-medium transition-colors font-heading",
                      isActive
                        ? "bg-primary-600 text-white dark:bg-primary-400 dark:text-slate-950 font-semibold shadow-galaxy-cyan"
                        : "bg-slate-100 text-slate-600 dark:bg-galaxy-input dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-galaxy-hover"
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Calendar Month Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-galaxy-border/50">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-heading">
                {monthNames[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-galaxy-hover text-slate-500 dark:text-slate-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-galaxy-hover text-slate-500 dark:text-slate-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center font-heading text-2xs text-slate-400">
              {dayNames.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const m = String(viewMonth + 1).padStart(2, "0");
                const d = String(day).padStart(2, "0");
                const dateStr = `${viewYear}-${m}-${d}`;

                const isStart = tempStart === dateStr;
                const isEnd = tempEnd === dateStr;
                const inRange =
                  tempStart &&
                  tempEnd &&
                  dateStr > tempStart &&
                  dateStr < tempEnd;
                const inHoverRange =
                  tempStart &&
                  !tempEnd &&
                  hoverDate &&
                  ((dateStr > tempStart && dateStr <= hoverDate) ||
                    (dateStr < tempStart && dateStr >= hoverDate));

                const isToday =
                  new Date().toISOString().slice(0, 10) === dateStr;

                return (
                  <button
                    key={day}
                    type="button"
                    onMouseEnter={() => setHoverDate(dateStr)}
                    onMouseLeave={() => setHoverDate(null)}
                    onClick={() => handleSelectDay(dateStr)}
                    className={cn(
                      "h-8 w-full font-mono text-xs transition-colors flex items-center justify-center",
                      (isStart || isEnd) &&
                        "bg-primary-600 text-white font-bold dark:bg-primary-400 dark:text-slate-950",
                      isStart && (tempEnd ? "rounded-l-lg" : "rounded-lg"),
                      isEnd && (tempStart ? "rounded-r-lg" : "rounded-lg"),
                      inRange &&
                        "bg-primary-50 text-primary-700 dark:bg-primary-400/15 dark:text-primary-300 font-medium",
                      inHoverRange &&
                        "bg-primary-50/60 dark:bg-primary-400/10 text-primary-600 dark:text-primary-300",
                      !isStart &&
                        !isEnd &&
                        !inRange &&
                        !inHoverRange &&
                        (isToday
                          ? "border border-primary-400 rounded-lg text-primary-600 dark:text-primary-400 font-semibold"
                          : "rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-galaxy-hover")
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Selection info and Action Buttons */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-galaxy-border/80 flex items-center justify-between">
              <div className="text-2xs font-mono text-slate-500 dark:text-galaxy-muted">
                {tempStart ? (
                  <span>
                    {tempStart} {tempEnd ? `s/d ${tempEnd}` : "(pilih akhir)"}
                  </span>
                ) : (
                  <span>Belum ada rentang</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleApply}
                  className="shadow-galaxy-cyan"
                  disabled={!tempStart}
                >
                  Terapkan
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
