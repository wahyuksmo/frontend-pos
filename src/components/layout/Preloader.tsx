"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-galaxy-body/95 backdrop-blur-md transition-opacity duration-300">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <Image
            src="/images/logo-sm.png"
            alt="Velzon"
            width={32}
            height={32}
            className="animate-pulse object-contain"
          />
          <div className="absolute inset-0 rounded-full border-2 border-primary-500 dark:border-primary-400 border-t-transparent animate-spin" />
        </div>
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">
          POS ENTERPRISE
        </span>
      </div>
    </div>
  );
}
