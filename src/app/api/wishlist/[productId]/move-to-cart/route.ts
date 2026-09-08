import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRole, errorResponse, json, ApiError } from "@/lib/api";
import { getOrCreateCart } from "@/lib/cart";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const user = await authRole("CUSTOMER");
    const { productId } = await params;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.published) throw new ApiError(404, "Product is no longer available");
    if (product.stock <= 0) throw new ApiError(409, "This product is out of stock");

    const cart = await getOrCreateCart(user.id);
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, size: null, color: null },
    });
    const qty = Math.min((existing?.quantity ?? 0) + 1, product.stock);

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: qty } });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: 1,
          size: product.sizes[0] ?? null,
          color: product.colors[0] ?? null,
        },
      });
    }

    await prisma.wishlistItem.deleteMany({
      where: { productId, wishlist: { userId: user.id } },
    });

    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
