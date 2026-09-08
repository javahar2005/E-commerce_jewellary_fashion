import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";

export default async function SellerDashboard() {
  const user = await requireRole("SELLER");
  const sellerId = user.sellerProfile!.id;

  const [total, active, orderItems, pendingItems, recent] = await Promise.all([
    prisma.product.count({ where: { sellerId } }),
    prisma.product.count({ where: { sellerId, published: true } }),
    prisma.orderItem.findMany({
      where: { sellerId, order: { paymentStatus: "PAID" } },
      select: { id: true, unitPrice: true, quantity: true, orderId: true },
    }),
    prisma.orderItem.count({
      where: { sellerId, status: "PROCESSING", order: { paymentStatus: "PAID" } },
    }),
    prisma.orderItem.findMany({
      where: { sellerId, order: { paymentStatus: "PAID" } },
      orderBy: { order: { createdAt: "desc" } },
      take: 6,
      include: { order: { select: { orderNumber: true, createdAt: true, shipFullName: true } } },
    }),
  ]);

  const distinctOrders = new Set(orderItems.map((i) => i.orderId)).size;
  const revenue = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-stone">An overview of {user.sellerProfile!.storeName}.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total products" value={total} />
        <StatCard label="Active products" value={active} hint={`${total - active} unpublished`} />
        <StatCard label="Orders received" value={distinctOrders} />
        <StatCard label="Pending orders" value={pendingItems} hint="Awaiting dispatch" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Lifetime revenue (paid)" value={formatPrice(revenue)} />
        <div className="flex items-center gap-3 border border-charcoal/10 bg-white p-5">
          <Link href="/seller/products/new" className="bg-charcoal px-4 py-2 text-sm text-ivory">
            Add a product
          </Link>
          <Link
            href="/seller/orders"
            className="border border-charcoal/25 px-4 py-2 text-sm hover:bg-beige"
          >
            View orders
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-lg text-charcoal">Recent orders</h2>
        {recent.length === 0 ? (
          <p className="border border-dashed border-charcoal/15 bg-white p-6 text-sm text-stone">
            No orders yet.
          </p>
        ) : (
          <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
            {recent.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="text-charcoal">{it.productName} × {it.quantity}</p>
                  <p className="text-xs text-stone">
                    {it.order.orderNumber} · {it.order.shipFullName} · {formatDate(it.order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={it.status} />
                  <span>{formatPrice(it.unitPrice * it.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
