import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { AccountNav } from "@/components/account/AccountNav";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const user = await requireRole("CUSTOMER");
  const orders = await prisma.order.findMany({
    where: { userId: user.id, paymentStatus: "PAID" },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="mb-8 font-serif text-3xl text-charcoal sm:text-4xl">Your orders</h1>
      <AccountNav />

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order it will appear here."
          actionHref="/products"
          actionLabel="Start shopping"
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="block border border-charcoal/10 bg-white p-5 transition-colors hover:border-charcoal/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-charcoal">{o.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-stone">
                      {formatDate(o.createdAt)} · {o.items.length}{" "}
                      {o.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={o.status} />
                    <span className="text-sm text-charcoal">{formatPrice(o.total)}</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {o.items.slice(0, 5).map((it) => (
                    <div key={it.id} className="h-14 w-12 shrink-0 overflow-hidden bg-beige">
                      {it.imageUrl && (
                        <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
