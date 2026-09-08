import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authSeller, errorResponse, json, ApiError } from "@/lib/api";
import { orderStatusSchema } from "@/lib/validations";

const RANK = { PROCESSING: 0, SHIPPED: 1, DELIVERED: 2 } as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { seller } = await authSeller();
    const { orderId } = await params;
    const { status } = orderStatusSchema.parse(await req.json());

    const sellerItems = await prisma.orderItem.findMany({
      where: { orderId, sellerId: seller.id },
    });
    if (sellerItems.length === 0) {
      throw new ApiError(404, "No items from your store in this order");
    }

    // Prevent moving backwards.
    const current = Math.min(...sellerItems.map((i) => RANK[i.status]));
    if (RANK[status] < current) {
      throw new ApiError(422, "Order status cannot move backwards");
    }

    await prisma.orderItem.updateMany({
      where: { orderId, sellerId: seller.id },
      data: { status },
    });

    // Recompute the overall order status as the least-progressed item.
    const all = await prisma.orderItem.findMany({ where: { orderId }, select: { status: true } });
    const min = all.reduce(
      (acc, i) => (RANK[i.status] < RANK[acc] ? i.status : acc),
      "DELIVERED" as "PROCESSING" | "SHIPPED" | "DELIVERED",
    );
    await prisma.order.update({ where: { id: orderId }, data: { status: min } });

    return json({ ok: true, status });
  } catch (e) {
    return errorResponse(e);
  }
}
