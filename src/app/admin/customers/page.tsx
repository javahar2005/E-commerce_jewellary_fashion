import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: { where: { paymentStatus: "PAID" }, select: { total: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Customers</h1>
      <p className="mt-1 text-sm text-stone">{customers.length} registered</p>

      <div className="mt-8 overflow-x-auto border border-charcoal/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-beige/60 text-left text-xs uppercase tracking-wide text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {customers.map((c) => (
              <tr key={c.id} className="bg-white">
                <td className="px-4 py-3 text-charcoal">{c.name}</td>
                <td className="px-4 py-3 text-stone">{c.email}</td>
                <td className="px-4 py-3 text-stone">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3">{c._count.orders}</td>
                <td className="px-4 py-3">
                  {formatPrice(c.orders.reduce((s, o) => s + o.total, 0))}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="text-xs underline hover:text-charcoal"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
