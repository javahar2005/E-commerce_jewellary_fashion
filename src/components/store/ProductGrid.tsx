import { ProductCard } from "./ProductCard";
import type { ProductCardData } from "@/lib/products";

export function ProductGrid({
  products,
  wishlistedIds = new Set<string>(),
}: {
  products: ProductCardData[];
  wishlistedIds?: Set<string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} wishlisted={wishlistedIds.has(p.id)} />
      ))}
    </div>
  );
}
