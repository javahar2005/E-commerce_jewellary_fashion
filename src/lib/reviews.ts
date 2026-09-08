import "server-only";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";

export type ReviewSummary = {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export const REVIEW_PAGE_SIZE = 8;

export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  const rows = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { rating: true },
  });
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary["distribution"];
  let total = 0;
  let count = 0;
  for (const r of rows) {
    const c = r._count.rating;
    distribution[r.rating as 1 | 2 | 3 | 4 | 5] = c;
    total += r.rating * c;
    count += c;
  }
  return {
    average: count ? Math.round((total / count) * 10) / 10 : 0,
    count,
    distribution,
  };
}

export async function getReviews(productId: string, take = REVIEW_PAGE_SIZE, skip = 0) {
  return prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take,
    skip,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });
}

export type ReviewCardData = Awaited<ReturnType<typeof getReviews>>[number];

/**
 * Orders through which `userId` may still review `productId`:
 * paid orders that contain the product and have no review yet for that order.
 */
export async function getReviewableOrders(userId: string, productId: string) {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      paymentStatus: "PAID",
      items: { some: { productId } },
      reviews: { none: { productId } },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, orderNumber: true, createdAt: true },
  });
  return orders;
}

export async function createReview(input: {
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  title?: string | null;
  body: string;
}) {
  const { userId, productId, orderId, rating, title, body } = input;

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw new ApiError(404, "Product not found");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId, paymentStatus: "PAID", items: { some: { productId } } },
    select: { id: true },
  });
  if (!order) {
    throw new ApiError(403, "You can only review products from your completed orders");
  }

  const existing = await prisma.review.findUnique({
    where: { orderId_productId: { orderId, productId } },
    select: { id: true },
  });
  if (existing) throw new ApiError(409, "You've already reviewed this product for that order");

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: { userId, productId, orderId, rating, title: title || null, body },
    });

    const agg = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await tx.product.update({
      where: { id: productId },
      data: {
        ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10,
        ratingCount: agg._count.rating,
      },
    });

    return review;
  });
}
