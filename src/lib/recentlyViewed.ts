import "server-only";
import { prisma } from "@/lib/prisma";
import { productCardSelect, type ProductCardData } from "@/lib/products";
import { RECENTLY_VIEWED_LIMIT } from "@/lib/search";

export async function recordProductView(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) return;

  await prisma.recentlyViewedProduct.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: { viewedAt: new Date() },
  });

  const extra = await prisma.recentlyViewedProduct.findMany({
    where: { userId },
    orderBy: { viewedAt: "desc" },
    skip: RECENTLY_VIEWED_LIMIT,
    select: { id: true },
  });
  if (extra.length) {
    await prisma.recentlyViewedProduct.deleteMany({
      where: { id: { in: extra.map((e) => e.id) } },
    });
  }
}

/** Recently viewed products for an authed customer, newest first, published only. */
export async function getRecentlyViewed(
  userId: string,
  excludeProductId?: string,
): Promise<ProductCardData[]> {
  const rows = await prisma.recentlyViewedProduct.findMany({
    where: {
      userId,
      productId: excludeProductId ? { not: excludeProductId } : undefined,
      product: { published: true },
    },
    orderBy: { viewedAt: "desc" },
    take: RECENTLY_VIEWED_LIMIT,
    select: { product: { select: productCardSelect } },
  });
  return rows.map((r) => r.product);
}

/** Resolve an ordered list of product ids to cards (for guests using localStorage). */
export async function resolveRecentlyViewed(ids: string[]): Promise<ProductCardData[]> {
  const clean = ids.filter(Boolean).slice(0, RECENTLY_VIEWED_LIMIT);
  if (!clean.length) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: clean }, published: true },
    select: productCardSelect,
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  return clean.map((id) => byId.get(id)).filter((p): p is ProductCardData => Boolean(p));
}
