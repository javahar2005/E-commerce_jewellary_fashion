"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initial,
  compact = false,
}: {
  productId: string;
  initial: boolean;
  compact?: boolean;
}) {
  const [active, setActive] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !active;
    setActive(next);
    start(async () => {
      const res = next
        ? await api("/api/wishlist", {
            method: "POST",
            body: JSON.stringify({ productId }),
          })
        : await api(`/api/wishlist/${productId}`, { method: "DELETE" });

      if (!res.ok) {
        setActive(!next);
        if (res.status === 401) {
          toast.error("Please sign in to use your wishlist");
          router.push("/login?next=/wishlist");
        } else {
          toast.error(res.error);
        }
        return;
      }
      toast.success(next ? "Added to wishlist" : "Removed from wishlist");
      router.refresh();
    });
  }

  if (compact) {
    return (
      <button
        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
        onClick={toggle}
        disabled={pending}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm hover:bg-white"
      >
        <Heart filled={active} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 border px-6 text-sm tracking-wide transition-colors",
        active
          ? "border-sage bg-sage/10 text-sage-deep"
          : "border-charcoal/30 text-charcoal hover:border-charcoal",
      )}
    >
      <Heart filled={active} />
      {active ? "In your wishlist" : "Add to wishlist"}
    </button>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" />
    </svg>
  );
}
