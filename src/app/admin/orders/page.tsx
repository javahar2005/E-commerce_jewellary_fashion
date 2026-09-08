import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, items: true },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-stone">{orders.length} total</p>

      <div className="mt-8 overflow-x-auto border border-charcoal/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-beige/60 text-left text-xs uppercase tracking-wide text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {orders.map((o) => (
              <tr key={o.id} className="bg-white hover:bg-beige/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-charcoal underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-stone">{o.user.name}</td>
                <td className="px-4 py-3 text-stone">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3">{o.items.length}</td>
                <td className="px-4 py-3 capitalize text-stone">{o.paymentStatus.toLowerCase()}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
