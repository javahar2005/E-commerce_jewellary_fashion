"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-y-auto border border-charcoal/15 bg-ivory p-6 shadow-xl animate-fade-in sm:max-w-lg thin-scroll",
          className,
        )}
      >
        {title && (
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-xl">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-stone hover:text-charcoal"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && <p className="text-sm text-stone">{message}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="border border-charcoal/25 px-4 py-2 text-xs tracking-wide hover:bg-beige"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="border border-[#b4796a] px-4 py-2 text-xs tracking-wide text-[#8f5748] hover:bg-[#b4796a]/10 disabled:opacity-50"
        >
          {loading ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
