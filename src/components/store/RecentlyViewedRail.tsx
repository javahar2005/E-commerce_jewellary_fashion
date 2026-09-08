"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { getLocalViewed } from "@/lib/localHistory";
import type { ProductCardData } from "@/lib/productShared";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";

export function RecentlyViewedRail({
  excludeId,
  wishlistedIds = [],
}: {
  excludeId?: string;
  wishlistedIds?: string[];
}) {
  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const wished = new Set(wishlistedIds);

  useEffect(() => {
    const ids = getLocalViewed().filter((id) => id !== excludeId);
    const params = new URLSearchParams();
    if (ids.length) params.set("ids", ids.join(","));
    if (excludeId) params.set("exclude", excludeId);

    api<{ products: ProductCardData[] }>(`/api/recently-viewed?${params.toString()}`)
      .then((res) => setProducts(res.ok ? res.data.products : []))
      .catch(() => setProducts([]));
  }, [excludeId]);

  if (!products || products.length === 0) return null;

  return (
    <section className="my-16">
      <SectionHeader eyebrow="Pick up where you left off" title="Recently viewed" />
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-x-6 thin-scroll">
        {products.map((p) => (
          <div key={p.id} className="w-44 shrink-0 sm:w-auto">
            <ProductCard product={p} wishlisted={wished.has(p.id)} />
          </div>
        ))}
      </div>
    </section>
  );
}
