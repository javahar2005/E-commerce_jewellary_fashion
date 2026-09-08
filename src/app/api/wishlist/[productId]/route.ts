import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRole, errorResponse, json } from "@/lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const user = await authRole("CUSTOMER");
    const { productId } = await params;
    await prisma.wishlistItem.deleteMany({
      where: { productId, wishlist: { userId: user.id } },
    });
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
