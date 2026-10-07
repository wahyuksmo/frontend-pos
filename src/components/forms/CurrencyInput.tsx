"use client";

import React, { useState, useEffect } from "react";
import { cn, parseCurrencyRaw } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  prefix?: string;
  hasError?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  prefix = "Rp ",
  hasError = false,
  className,
  disabled,
  placeholder = "0",
  ...props
}: CurrencyInputProps) {
  const formatDisplay = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num) || num === 0) return "";
    return num.toLocaleString("id-ID");
  };

  const [displayValue, setDisplayValue] = useState(() => formatDisplay(value));

  useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numeric = parseCurrencyRaw(rawVal);

    if (rawVal === "" || numeric === 0) {
      setDisplayValue("");
      onChange(null);
    } else {
      setDisplayValue(numeric.toLocaleString("id-ID"));
      onChange(numeric);
    }
  };

  return (
    <div className="relative flex items-center w-full">
      {prefix && (
        <span className="absolute left-3 text-sm font-medium text-slate-400 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-galaxy-input dark:text-slate-100 dark:placeholder:text-slate-500",
          prefix && "pl-10",
          hasError
            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-300 focus:border-primary-400 focus:ring-primary-400/20 dark:border-galaxy-border dark:focus:border-primary-400",
          className
        )}
        {...props}
      />
    </div>
  );
}
