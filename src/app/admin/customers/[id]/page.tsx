import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/customers" className="text-xs text-stone hover:text-charcoal">
        ← Customers
      </Link>
      <h1 className="mt-3 font-serif text-2xl text-charcoal sm:text-3xl">{customer.name}</h1>
      <p className="mt-1 text-sm text-stone">
        {customer.email} · {customer.phone ?? "no phone"} · joined {formatDate(customer.createdAt)}
      </p>

      <section className="mt-8">
        <h2 className="eyebrow mb-3">Addresses</h2>
        {customer.addresses.length === 0 ? (
          <p className="text-sm text-stone">No saved addresses.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {customer.addresses.map((a) => (
              <div key={a.id} className="border border-charcoal/10 bg-white p-3 text-sm">
                <p className="text-charcoal">{a.fullName}</p>
                <p className="text-charcoal/75">
                  {a.line1}, {a.city}, {a.state} {a.postalCode}, {a.country}
                </p>
                <p className="text-stone">{a.phone}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="eyebrow mb-3">Orders ({customer.orders.length})</h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-stone">No orders.</p>
        ) : (
          <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
            {customer.orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-beige/40"
              >
                <div>
                  <p className="text-charcoal">{o.orderNumber}</p>
                  <p className="text-xs text-stone">
                    {formatDate(o.createdAt)} · {o.items.length} items · {o.paymentStatus.toLowerCase()}
                  </p>
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
