import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getStorefrontProducts, getFilterFacets } from "@/lib/products";
import { getWishlistedIds } from "@/lib/viewer";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductFilters } from "@/components/store/ProductFilters";
import { SortSelect } from "@/components/store/SortSelect";
import { Pagination } from "@/components/store/Pagination";
import { EmptyState } from "@/components/ui/States";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Shop All" };

type SP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = str(sp.q);
  const category = str(sp.category);
  const group = str(sp.group);
  const size = str(sp.size);
  const color = str(sp.color);
  const sort = (str(sp.sort) ?? "newest") as any;
  const minPrice = str(sp.minPrice) ? Number(str(sp.minPrice)) : undefined;
  const maxPrice = str(sp.maxPrice) ? Number(str(sp.maxPrice)) : undefined;
  const inStock = str(sp.inStock) === "1";
  const discounted = str(sp.discounted) === "1";
  const page = str(sp.page) ? Number(str(sp.page)) : 1;

  const [{ items, total, pages }, facets, categories, wishlisted] = await Promise.all([
    getStorefrontProducts({ q, category, group, size, color, sort, minPrice, maxPrice, inStock, discounted, page }),
    getFilterFacets(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getWishlistedIds(),
  ]);

  const activeCategory = category
    ? categories.find((c) => c.slug === category)?.name
    : group;

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      const val = str(v);
      if (val && k !== "page") params.set(k, val);
    });
    params.set("page", String(p));
    return `/products?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="eyebrow mb-2">Shop</p>
        <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">
          {q ? `Results for “${q}”` : activeCategory || "All pieces"}
        </h1>
        <p className="mt-2 text-sm text-stone">{total} {total === 1 ? "piece" : "pieces"}</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <div>
          <ProductFilters categories={categories} facets={facets} />
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between border-b border-charcoal/10 pb-4">
            <p className="text-sm text-stone">
              Showing {items.length} of {total}
            </p>
            <SortSelect />
          </div>

          {items.length === 0 ? (
            <EmptyState
              title="Nothing matches those filters"
              description="Try widening your price range or clearing a filter."
              actionHref="/products"
              actionLabel="Clear filters"
            />
          ) : (
            <>
              <ProductGrid products={items} wishlistedIds={wishlisted} />
              <Pagination page={page} pages={pages} makeHref={makeHref} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
