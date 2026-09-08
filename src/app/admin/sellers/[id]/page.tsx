import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { primaryImage } from "@/lib/products";
import { StatusBadge, Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const RANK = { PROCESSING: 0, SHIPPED: 1, DELIVERED: 2 } as const;

export default async function AdminSellerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seller = await prisma.sellerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true, addresses: true } },
      products: {
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] }, category: true },
      },
    },
  });
  if (!seller) notFound();

  const orderItems = await prisma.orderItem.findMany({
    where: { sellerId: id, order: { paymentStatus: "PAID" } },
    orderBy: { order: { createdAt: "desc" } },
    include: { order: { select: { id: true, orderNumber: true, createdAt: true } } },
  });

  const orders = new Map<string, { number: string; date: Date; total: number; status: string }>();
  for (const it of orderItems) {
    const e = orders.get(it.order.id) ?? {
      number: it.order.orderNumber,
      date: it.order.createdAt,
      total: 0,
      status: "DELIVERED",
    };
    e.total += it.unitPrice * it.quantity;
    if (RANK[it.status] < RANK[e.status as keyof typeof RANK]) e.status = it.status;
    orders.set(it.order.id, e);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/sellers" className="text-xs text-stone hover:text-charcoal">
        ← Sellers
      </Link>
      <h1 className="mt-3 font-serif text-2xl text-charcoal sm:text-3xl">{seller.storeName}</h1>
      <p className="mt-1 text-sm text-stone">
        {seller.user.name} · {seller.user.email} · {seller.user.phone ?? "no phone"}
      </p>
      {seller.bio && <p className="mt-2 max-w-xl text-sm text-charcoal/80">{seller.bio}</p>}

      <section className="mt-8">
        <h2 className="eyebrow mb-3">Products ({seller.products.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {seller.products.map((p) => (
            <div key={p.id} className="flex gap-3 border border-charcoal/10 bg-white p-3 text-sm">
              <div className="h-16 w-14 shrink-0 overflow-hidden bg-beige">
                {primaryImage(p.images) && (
                  <img src={primaryImage(p.images)!} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-charcoal">{p.name}</p>
                <p className="text-xs text-stone">
                  {p.category.name} · {formatPrice(p.price)} · stock {p.stock}
                </p>
                <div className="mt-1">
                  <Badge tone={p.published ? "sage" : "neutral"}>
                    {p.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="eyebrow mb-3">Orders ({orders.size})</h2>
        {orders.size === 0 ? (
          <p className="text-sm text-stone">No orders yet.</p>
        ) : (
          <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
            {[...orders.entries()].map(([oid, o]) => (
              <Link
                key={oid}
                href={`/admin/orders/${oid}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-beige/40"
              >
                <div>
                  <p className="text-charcoal">{o.number}</p>
                  <p className="text-xs text-stone">{formatDate(o.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span>{formatPrice(o.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
