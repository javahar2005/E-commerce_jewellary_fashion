import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { OrderStatusTrail } from "@/components/store/OrderStatusTrail";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { slug: true } },
        },
      },
    },
  });
  if (!order) notFound();

  const sellerIds = [...new Set(order.items.map((i) => i.sellerId))];
  const sellers = await prisma.sellerProfile.findMany({
    where: { id: { in: sellerIds } },
    select: { id: true, storeName: true },
  });
  const storeName = (sid: string) => sellers.find((s) => s.id === sid)?.storeName ?? "Unknown store";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/orders" className="text-xs text-stone hover:text-charcoal">
        ← Orders
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-stone">
            {formatDate(order.createdAt)} · payment {order.paymentStatus.toLowerCase()}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6 border border-charcoal/10 bg-white p-5">
        <OrderStatusTrail status={order.status} />
      </div>

      <section className="mt-8">
        <h2 className="eyebrow mb-3">Items</h2>
        <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
          {order.items.map((it) => (
            <li key={it.id} className="flex gap-4 py-4 text-sm">
              <div className="h-20 w-16 shrink-0 overflow-hidden bg-beige">
                {it.imageUrl && (
                  <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-1 justify-between">
                <div>
                  <p className="text-charcoal">{it.productName}</p>
                  <p className="text-xs text-stone">
                    {storeName(it.sellerId)} ·{" "}
                    {[it.size, it.color].filter(Boolean).join(" · ")}
                    {(it.size || it.color) && " · "}Qty {it.quantity}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={it.status} />
                  </div>
                </div>
                <p>{formatPrice(it.unitPrice * it.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <h3 className="eyebrow mb-2">Customer</h3>
          <p className="text-charcoal">{order.user.name}</p>
          <p className="text-stone">{order.user.email}</p>
          <p className="text-stone">{order.shipPhone}</p>
        </div>
        <div>
          <h3 className="eyebrow mb-2">Ship to</h3>
          <p className="text-charcoal/80">
            {order.shipFullName}
            <br />
            {order.shipLine1}, {order.shipCity}, {order.shipState} {order.shipPostal}
            <br />
            {order.shipCountry}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-charcoal/10 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-stone">Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone">Shipping</span>
          <span>{formatPrice(order.total - order.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-base">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
