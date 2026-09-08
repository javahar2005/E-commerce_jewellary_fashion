"use client";

import { useEffect, useState } from "react";
import { subscribe, dismiss, type ToastItem } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribe(setItems), []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            "pointer-events-auto w-full max-w-sm border px-4 py-3 text-sm shadow-sm transition animate-fade-in text-left",
            t.kind === "success" && "border-sage bg-white text-charcoal",
            t.kind === "error" && "border-[#b4796a] bg-white text-charcoal",
            t.kind === "info" && "border-beige-deep bg-white text-charcoal",
          )}
        >
          <span
            className={cn(
              "mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle",
              t.kind === "success" && "bg-sage",
              t.kind === "error" && "bg-[#b4796a]",
              t.kind === "info" && "bg-champagne",
            )}
          />
          {t.message}
        </button>
      ))}
    </div>
  );
}
