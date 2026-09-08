import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRole, errorResponse, json, ApiError } from "@/lib/api";
import { updateCartItemSchema } from "@/lib/validations";
import { getCartDetail } from "@/lib/cart";

async function ownItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    include: { product: true },
  });
  if (!item) throw new ApiError(404, "Item not found in your cart");
  return item;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await authRole("CUSTOMER");
    const { itemId } = await params;
    const { quantity } = updateCartItemSchema.parse(await req.json());
    const item = await ownItem(user.id, itemId);

    if (quantity > item.product.stock) {
      throw new ApiError(409, `Only ${item.product.stock} in stock`);
    }
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return json(await getCartDetail(user.id));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await authRole("CUSTOMER");
    const { itemId } = await params;
    await ownItem(user.id, itemId);
    await prisma.cartItem.delete({ where: { id: itemId } });
    return json(await getCartDetail(user.id));
  } catch (e) {
    return errorResponse(e);
  }
}
