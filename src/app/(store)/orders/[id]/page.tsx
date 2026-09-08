import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusTrail } from "@/components/store/OrderStatusTrail";
import { StatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("CUSTOMER");
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: { include: { product: { select: { slug: true } } } },
      reviews: { select: { productId: true } },
    },
  });

  if (!order) notFound();

  const reviewedProductIds = new Set(order.reviews.map((r) => r.productId));
  const canReview = order.paymentStatus === "PAID";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/orders" className="text-xs text-stone hover:text-charcoal">
        ← All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-stone">Placed {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-8 border border-charcoal/10 bg-white p-5">
        <OrderStatusTrail status={order.status} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-serif text-lg text-charcoal">Items</h2>
        <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
          {order.items.map((it) => (
            <li key={it.id} className="flex gap-4 py-4">
              <div className="h-20 w-16 shrink-0 overflow-hidden bg-beige">
                {it.imageUrl && (
                  <img src={it.imageUrl} alt={it.productName} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-1 justify-between text-sm">
                <div>
                  {it.product ? (
                    <Link
                      href={`/products/${it.product.slug}`}
                      className="font-serif text-charcoal hover:text-stone"
                    >
                      {it.productName}
                    </Link>
                  ) : (
                    <span className="font-serif text-charcoal">{it.productName}</span>
                  )}
                  <p className="mt-1 text-xs text-stone">
                    {[it.size, it.color].filter(Boolean).join(" · ")}
                    {(it.size || it.color) && " · "}Qty {it.quantity}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={it.status} />
                  </div>
                  {canReview && it.product && (
                    <p className="mt-2 text-xs">
                      {reviewedProductIds.has(it.productId ?? "") ? (
                        <span className="text-sage-deep">✓ Reviewed</span>
                      ) : (
                        <Link
                          href={`/products/${it.product.slug}#reviews`}
                          className="link-underline text-charcoal"
                        >
                          Write a review
                        </Link>
                      )}
                    </p>
                  )}
                </div>
                <p>{formatPrice(it.unitPrice * it.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="text-sm">
          <h3 className="eyebrow mb-2">Shipping address</h3>
          <p className="text-charcoal">{order.shipFullName}</p>
          <p className="text-charcoal/75">
            {order.shipLine1}
            <br />
            {order.shipCity}, {order.shipState} {order.shipPostal}
            <br />
            {order.shipCountry}
          </p>
          <p className="mt-1 text-stone">{order.shipPhone}</p>
        </div>
        <div className="text-sm">
          <h3 className="eyebrow mb-2">Summary</h3>
          <dl className="space-y-1">
            <div className="flex justify-between">
              <dt className="text-stone">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Shipping</dt>
              <dd>{formatPrice(order.total - order.subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-charcoal/10 pt-1 text-base">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-stone">Payment: {order.paymentStatus.toLowerCase()}</p>
        </div>
      </div>
    </div>
  );
}
