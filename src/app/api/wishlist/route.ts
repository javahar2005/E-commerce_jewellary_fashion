import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRole, errorResponse, json, ApiError } from "@/lib/api";
import { wishlistItemSchema } from "@/lib/validations";

async function getOrCreateWishlist(userId: string) {
  return prisma.wishlist.upsert({ where: { userId }, create: { userId }, update: {} });
}

export async function POST(req: NextRequest) {
  try {
    const user = await authRole("CUSTOMER");
    const { productId } = wishlistItemSchema.parse(await req.json());

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError(404, "Product not found");

    const wishlist = await getOrCreateWishlist(user.id);
    await prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      create: { wishlistId: wishlist.id, productId },
      update: {},
    });
    return json({ ok: true }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
