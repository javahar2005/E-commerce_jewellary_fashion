import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SellerOrderList } from "@/components/seller/SellerOrderList";

export const dynamic = "force-dynamic";

const RANK = { PROCESSING: 0, SHIPPED: 1, DELIVERED: 2 } as const;

export default async function SellerOrdersPage() {
  const user = await requireRole("SELLER");
  const sellerId = user.sellerProfile!.id;

  const items = await prisma.orderItem.findMany({
    where: { sellerId, order: { paymentStatus: "PAID" } },
    orderBy: { order: { createdAt: "desc" } },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          shipFullName: true,
          shipPhone: true,
          shipLine1: true,
          shipCity: true,
          shipState: true,
          shipPostal: true,
          shipCountry: true,
          user: { select: { name: true, phone: true } },
        },
      },
    },
  });

  type OrderGroup = {
    orderId: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    customerName: string;
    customerPhone: string;
    address: string;
    items: any[];
    total: number;
  };
  const byOrder = new Map<string, OrderGroup>();

  for (const it of items) {
    const o = it.order;
    if (!byOrder.has(o.id)) {
      byOrder.set(o.id, {
        orderId: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt.toISOString(),
        status: "DELIVERED",
        customerName: o.user.name,
        customerPhone: o.shipPhone || o.user.phone || "—",
        address: `${o.shipLine1}, ${o.shipCity}, ${o.shipState} ${o.shipPostal}, ${o.shipCountry}`,
        items: [],
        total: 0,
      });
    }
    const entry = byOrder.get(o.id)!;
    entry.items.push({
      id: it.id,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      size: it.size,
      color: it.color,
      imageUrl: it.imageUrl,
    });
    entry.total += it.unitPrice * it.quantity;
    if (RANK[it.status] < RANK[entry.status as keyof typeof RANK]) entry.status = it.status;
  }

  const orders = [...byOrder.values()];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-stone">
        Orders that contain your products. You only see and manage your own items.
      </p>
      <div className="mt-8">
        <SellerOrderList initial={orders} />
      </div>
    </div>
  );
}
