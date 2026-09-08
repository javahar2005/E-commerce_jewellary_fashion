import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRole, errorResponse, json, ApiError } from "@/lib/api";
import { cartItemSchema } from "@/lib/validations";
import { getOrCreateCart, getCartDetail } from "@/lib/cart";

export async function GET() {
  try {
    const user = await authRole("CUSTOMER");
    return json(await getCartDetail(user.id));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authRole("CUSTOMER");
    const { productId, quantity, size, color } = cartItemSchema.parse(await req.json());

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.published) throw new ApiError(404, "Product not found");
    if (product.stock <= 0) throw new ApiError(409, "This product is out of stock");

    const cart = await getOrCreateCart(user.id);
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, size: size ?? null, color: color ?? null },
    });

    const nextQty = (existing?.quantity ?? 0) + quantity;
    if (nextQty > product.stock) {
      throw new ApiError(409, `Only ${product.stock} in stock`);
    }

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQty } });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, size: size ?? null, color: color ?? null },
      });
    }

    return json(await getCartDetail(user.id), 201);
  } catch (e) {
    return errorResponse(e);
  }
}
