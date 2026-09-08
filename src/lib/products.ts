import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export { productCardSelect, primaryImage } from "@/lib/productShared";
export type { ProductCardData } from "@/lib/productShared";
import { productCardSelect } from "@/lib/productShared";

type Sort = "newest" | "price-asc" | "price-desc" | "popular";

export type ProductFilter = {
  q?: string;
  category?: string;
  group?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStock?: boolean;
  discounted?: boolean;
  sort?: Sort;
  page?: number;
  perPage?: number;
};

export async function getStorefrontProducts(filter: ProductFilter) {
  const perPage = filter.perPage ?? 12;
  const page = Math.max(1, filter.page ?? 1);

  const where: Prisma.ProductWhereInput = { published: true };

  if (filter.q) {
    where.OR = [
      { name: { contains: filter.q, mode: "insensitive" } },
      { description: { contains: filter.q, mode: "insensitive" } },
      { material: { contains: filter.q, mode: "insensitive" } },
      { category: { name: { contains: filter.q, mode: "insensitive" } } },
    ];
  }
  const categoryWhere: Prisma.CategoryWhereInput = {};
  if (filter.category) categoryWhere.slug = filter.category;
  if (filter.group) categoryWhere.group = filter.group;
  if (Object.keys(categoryWhere).length) where.category = categoryWhere;
  // Price range always compares against the FINAL (discounted) selling price.
  if (filter.minPrice != null || filter.maxPrice != null) {
    where.effectivePrice = {};
    if (filter.minPrice != null) where.effectivePrice.gte = filter.minPrice;
    if (filter.maxPrice != null) where.effectivePrice.lte = filter.maxPrice;
  }
  if (filter.size) where.sizes = { has: filter.size };
  if (filter.color) where.colors = { has: filter.color };
  if (filter.inStock) where.stock = { gt: 0 };
  // "Discounted" — only products that genuinely sell below list price.
  // discount 0–90 with price > 0 (enforced on write) guarantees effectivePrice < price.
  if (filter.discounted) where.discount = { gt: 0 };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filter.sort === "price-asc"
      ? { effectivePrice: "asc" }
      : filter.sort === "price-desc"
        ? { effectivePrice: "desc" }
        : filter.sort === "popular"
          ? { featured: "desc" }
          : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: filter.sort === "popular" ? [{ featured: "desc" }, { createdAt: "desc" }] : orderBy,
      select: productCardSelect,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getFilterFacets() {
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { sizes: true, colors: true, effectivePrice: true },
  });
  const sizes = new Set<string>();
  const colors = new Set<string>();
  let min = Infinity;
  let max = 0;
  for (const p of products) {
    p.sizes.forEach((s) => sizes.add(s));
    p.colors.forEach((c) => colors.add(c));
    min = Math.min(min, p.effectivePrice);
    max = Math.max(max, p.effectivePrice);
  }
  return {
    sizes: [...sizes].sort(),
    colors: [...colors].sort(),
    minPrice: Number.isFinite(min) ? min : 0,
    maxPrice: max || 100000,
  };
}
