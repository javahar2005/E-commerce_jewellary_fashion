import "server-only";
import { prisma } from "@/lib/prisma";

export const RECENT_SEARCH_LIMIT = 3;
export const RECENTLY_VIEWED_LIMIT = 10;

export function normaliseQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 80);
}

export async function getRecentSearches(userId: string) {
  const rows = await prisma.recentSearch.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: RECENT_SEARCH_LIMIT,
    select: { query: true },
  });
  return rows.map((r) => r.query);
}

export async function recordSearch(userId: string, rawQuery: string) {
  const query = normaliseQuery(rawQuery);
  if (query.length < 2) return;

  await prisma.recentSearch.upsert({
    where: { userId_query: { userId, query } },
    create: { userId, query },
    update: { updatedAt: new Date() },
  });

  // Trim to the newest RECENT_SEARCH_LIMIT.
  const extra = await prisma.recentSearch.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    skip: RECENT_SEARCH_LIMIT,
    select: { id: true },
  });
  if (extra.length) {
    await prisma.recentSearch.deleteMany({ where: { id: { in: extra.map((e) => e.id) } } });
  }
}

/** Distinct free-text suggestions drawn from live marketplace data. */
export async function getSuggestions(rawQuery: string, limit = 8): Promise<string[]> {
  const q = normaliseQuery(rawQuery);
  if (q.length < 3) return [];

  const contains = { contains: q, mode: "insensitive" as const };

  const [products, categories, sellers] = await Promise.all([
    prisma.product.findMany({
      where: {
        published: true,
        OR: [{ name: contains }, { material: contains }],
      },
      select: { name: true, material: true },
      take: 20,
      orderBy: [{ featured: "desc" }, { effectivePrice: "asc" }],
    }),
    prisma.category.findMany({
      where: { OR: [{ name: contains }, { group: contains }] },
      select: { name: true, group: true },
    }),
    prisma.sellerProfile.findMany({
      where: { storeName: contains, products: { some: { published: true } } },
      select: { storeName: true },
      take: 5,
    }),
  ]);

  const seen = new Set<string>();
  const out: string[] = [];
  const push = (value?: string | null) => {
    if (!value) return;
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(value);
  };

  products.forEach((p) => push(p.name));
  categories.forEach((c) => {
    push(c.name);
    push(`${c.group} — ${c.name}`);
  });
  products.forEach((p) => {
    if (p.material?.toLowerCase().includes(q.toLowerCase())) push(p.material);
  });
  sellers.forEach((s) => push(s.storeName));

  return out.slice(0, limit);
}
