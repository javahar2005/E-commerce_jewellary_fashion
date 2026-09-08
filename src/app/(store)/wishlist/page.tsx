import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistView } from "@/components/store/WishlistView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireRole("CUSTOMER");
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }], take: 1 },
              seller: { select: { storeName: true } },
            },
          },
        },
      },
    },
  });

  const items = (wishlist?.items ?? []).map((it) => ({
    productId: it.productId,
    slug: it.product.slug,
    name: it.product.name,
    image: it.product.images[0]?.url ?? null,
    storeName: it.product.seller.storeName,
    price: it.product.price,
    discount: it.product.discount,
    stock: it.product.published ? it.product.stock : 0,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow mb-2">Saved</p>
      <h1 className="mb-8 font-serif text-3xl text-charcoal sm:text-4xl">Your wishlist</h1>
      <WishlistView initial={items} />
    </div>
  );
}
