"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function AddToCartForm({
  productId,
  sizes,
  colors,
  maxStock,
}: {
  productId: string;
  sizes: string[];
  colors: string[];
  maxStock: number;
}) {
  const router = useRouter();
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState<"cart" | "buy" | null>(null);

  const soldOut = maxStock <= 0;

  async function add(mode: "cart" | "buy") {
    if (sizes.length && !size) return toast.error("Please select a size");
    if (colors.length && !color) return toast.error("Please select a color");
    setLoading(mode);
    const res = await api("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity: qty, size, color }),
    });
    setLoading(null);
    if (!res.ok) {
      if (res.status === 401) {
        toast.error("Please sign in to shop");
        router.push("/login?next=/cart");
        return;
      }
      toast.error(res.error);
      return;
    }
    if (mode === "buy") {
      router.push("/checkout");
    } else {
      toast.success("Added to bag");
      router.refresh();
    }
  }

  if (soldOut) {
    return (
      <div className="border border-charcoal/20 bg-beige/50 px-4 py-3 text-sm text-stone">
        This piece is currently sold out. Add it to your wishlist to be reminded.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sizes.length > 0 && (
        <div>
          <p className="eyebrow mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "min-w-[3rem] border px-3 py-2 text-sm",
                  size === s
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-charcoal/25 hover:border-charcoal",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="eyebrow mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "border px-3 py-2 text-sm",
                  color === c
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-charcoal/25 hover:border-charcoal",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="eyebrow mb-2">Quantity</p>
        <div className="inline-flex items-center border border-charcoal/25">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-10 text-lg text-stone hover:text-charcoal"
          >
            −
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
            className="h-10 w-10 text-lg text-stone hover:text-charcoal"
          >
            +
          </button>
        </div>
        {maxStock <= 5 && (
          <p className="mt-2 text-xs text-[#8a713f]">Only {maxStock} left in stock</p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button onClick={() => add("cart")} disabled={loading !== null}>
          {loading === "cart" ? "Adding…" : "Add to bag"}
        </Button>
        <Button onClick={() => add("buy")} variant="outline" disabled={loading !== null}>
          {loading === "buy" ? "…" : "Buy it now"}
        </Button>
      </div>
    </div>
  );
}
