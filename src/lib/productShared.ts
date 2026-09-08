import type { Prisma } from "@prisma/client";

/** Prisma-free (no runtime DB import) so it is safe in client components too. */
export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  discount: true,
  effectivePrice: true,
  stock: true,
  material: true,
  colors: true,
  sizes: true,
  createdAt: true,
  featured: true,
  category: { select: { name: true, slug: true, group: true } },
  seller: { select: { storeName: true } },
  images: {
    select: { url: true, isPrimary: true, position: true },
    orderBy: [{ isPrimary: "desc" }, { position: "asc" }] as const,
  },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export function primaryImage(
  images: { url: string; isPrimary: boolean; position: number }[],
) {
  if (!images.length) return null;
  return (images.find((i) => i.isPrimary) ?? images[0]).url;
}
