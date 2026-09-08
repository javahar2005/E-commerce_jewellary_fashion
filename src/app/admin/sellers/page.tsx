import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSellersPage() {
  const sellers = await prisma.sellerProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Sellers</h1>
      <p className="mt-1 text-sm text-stone">{sellers.length} stores</p>

      <div className="mt-8 overflow-x-auto border border-charcoal/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-beige/60 text-left text-xs uppercase tracking-wide text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {sellers.map((s) => (
              <tr key={s.id} className="bg-white">
                <td className="px-4 py-3 text-charcoal">{s.storeName}</td>
                <td className="px-4 py-3 text-stone">{s.user.name}</td>
                <td className="px-4 py-3 text-stone">{s.user.email}</td>
                <td className="px-4 py-3">{s._count.products}</td>
                <td className="px-4 py-3 text-stone">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/sellers/${s.id}`}
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
