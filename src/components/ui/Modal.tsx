"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  onSubmit,
  maxWidth = "2xl",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | HTMLFormElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore upon close
    const previousActiveElement = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on first input/select/textarea, or first focusable element
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        const firstInput = dialogRef.current.querySelector<HTMLElement>(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
        );
        if (firstInput) {
          firstInput.focus();
        } else {
          const firstFocusable = dialogRef.current.querySelector<HTMLElement>(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        }
      }
    }, 50);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      if (previousActiveElement && typeof previousActiveElement.focus === "function") {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-3xl",
    xl: "max-w-4xl",
    "2xl": "max-w-5xl",
    "3xl": "max-w-6xl",
    "4xl": "max-w-7xl",
    "5xl": "max-w-[92vw]",
  };

  const DialogTag = onSubmit ? "form" : "div";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <DialogTag
        // @ts-expect-error Form vs Div ref polymorphism
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        onSubmit={onSubmit}
        className={cn(
          "relative flex flex-col max-h-[92vh] w-full rounded-2xl bg-white shadow-2xl transition-all dark:bg-galaxy-card border border-slate-200 dark:border-galaxy-border z-10 overflow-hidden",
          maxWidthStyles[maxWidth]
        )}
      >
        {(title || description) && (
          <div className="flex shrink-0 items-start justify-between px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-galaxy-border/80 relative z-10">
            <div>
              {title && (
                <h3
                  id="modal-title"
                  className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-galaxy-muted mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-galaxy-hover dark:hover:text-slate-200 transition-colors"
              aria-label="Tutup Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">{children}</div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-galaxy-border/80 bg-slate-50/50 dark:bg-galaxy-input/30 relative z-10">
            {footer}
          </div>
        )}
      </DialogTag>
    </div>
  );
}
