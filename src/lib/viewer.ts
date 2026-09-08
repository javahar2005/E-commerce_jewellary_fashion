import "server-only";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/** Set of product ids the current customer has wishlisted (empty otherwise). */
export async function getWishlistedIds(): Promise<Set<string>> {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") return new Set();
  const items = await prisma.wishlistItem.findMany({
    where: { wishlist: { userId: session.userId } },
    select: { productId: true },
  });
  return new Set(items.map((i) => i.productId));
}
