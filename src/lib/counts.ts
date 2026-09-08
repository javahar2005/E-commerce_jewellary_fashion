import "server-only";
import { prisma } from "@/lib/prisma";

export async function getNavCounts(userId: string | undefined) {
  if (!userId) return { cart: 0, wishlist: 0 };
  const [cart, wishlist] = await Promise.all([
    prisma.cartItem.aggregate({
      where: { cart: { userId } },
      _sum: { quantity: true },
    }),
    prisma.wishlistItem.count({ where: { wishlist: { userId } } }),
  ]);
  return { cart: cart._sum.quantity ?? 0, wishlist };
}
