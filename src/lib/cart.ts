import "server-only";
import { prisma } from "@/lib/prisma";
import { discountedPrice } from "@/lib/utils";

export const SHIPPING_FLAT = 900;
export const FREE_SHIPPING_THRESHOLD = 15000;

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function getCartDetail(userId: string) {
  const cart = await getOrCreateCart(userId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    orderBy: { createdAt: "asc" },
    include: {
      product: {
        include: {
          images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }], take: 1 },
          seller: { select: { id: true, storeName: true } },
        },
      },
    },
  });

  const lines = items.map((item) => {
    const unit = discountedPrice(item.product.price, item.product.discount);
    const available = item.product.stock;
    const issue =
      !item.product.published
        ? "unavailable"
        : available <= 0
          ? "out_of_stock"
          : item.quantity > available
            ? "insufficient"
            : null;
    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      image: item.product.images[0]?.url ?? null,
      storeName: item.product.seller.storeName,
      sellerId: item.product.seller.id,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: unit,
      lineTotal: unit * item.quantity,
      available,
      issue,
    };
  });

  const subtotal = lines
    .filter((l) => !l.issue || l.issue === "insufficient")
    .reduce((s, l) => s + l.unitPrice * Math.min(l.quantity, Math.max(l.available, 0)), 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const hasBlockingIssues = lines.some((l) => l.issue);

  return {
    cartId: cart.id,
    lines,
    subtotal,
    shipping,
    total: subtotal + shipping,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    hasBlockingIssues,
  };
}
