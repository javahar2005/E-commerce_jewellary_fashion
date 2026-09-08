import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";

export default async function AdminDashboard() {
  const [customers, sellers, products, orders, revenue, recent] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.product.count(),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } }, items: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Marketplace overview</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total customers" value={customers} />
        <StatCard label="Total sellers" value={sellers} />
        <StatCard label="Total products" value={products} />
        <StatCard label="Total orders" value={orders} />
      </div>
      <div className="mt-4">
        <StatCard label="Gross revenue (paid orders)" value={formatPrice(revenue._sum.total ?? 0)} />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg text-charcoal">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-stone hover:text-charcoal">
            All orders
          </Link>
        </div>
        <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="flex items-center justify-between py-3 text-sm hover:bg-beige/40"
            >
              <div>
                <p className="text-charcoal">{o.orderNumber}</p>
                <p className="text-xs text-stone">
                  {o.user.name} · {o.items.length} items · {formatDate(o.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <span>{formatPrice(o.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
