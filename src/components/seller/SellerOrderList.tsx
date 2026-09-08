"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";

type Item = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  size: string | null;
  color: string | null;
  imageUrl: string | null;
};
type Order = {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: Item[];
  total: number;
};

const NEXT: Record<string, { value: string; label: string } | null> = {
  PROCESSING: { value: "SHIPPED", label: "Mark as shipped" },
  SHIPPED: { value: "DELIVERED", label: "Mark as delivered" },
  DELIVERED: null,
};

export function SellerOrderList({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  async function advance(order: Order) {
    const next = NEXT[order.status];
    if (!next) return;
    setBusy(order.orderId);
    const res = await api<{ status: string }>(`/api/seller/orders/${order.orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next.value }),
    });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setOrders((o) =>
      o.map((x) => (x.orderId === order.orderId ? { ...x, status: res.data.status } : x)),
    );
    toast.success(`Order ${next.value.toLowerCase()}`);
    router.refresh();
  }

  if (orders.length === 0) {
    return <EmptyState title="No orders yet" description="Orders with your products will appear here." />;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const next = NEXT[order.status];
        return (
          <div key={order.orderId} className="border border-charcoal/10 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal/10 px-5 py-3">
              <div>
                <p className="font-medium text-charcoal">{order.orderNumber}</p>
                <p className="text-xs text-stone">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                {next && (
                  <button
                    disabled={busy === order.orderId}
                    onClick={() => advance(order)}
                    className="border border-charcoal px-3 py-1.5 text-xs hover:bg-beige disabled:opacity-50"
                  >
                    {next.label}
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_240px]">
              <div>
                <ul className="space-y-3">
                  {order.items.map((it) => (
                    <li key={it.id} className="flex gap-3 text-sm">
                      <div className="h-14 w-12 shrink-0 overflow-hidden bg-beige">
                        {it.imageUrl && (
                          <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 justify-between">
                        <div>
                          <p className="text-charcoal">{it.productName}</p>
                          <p className="text-xs text-stone">
                            {[it.size, it.color].filter(Boolean).join(" · ")}
                            {(it.size || it.color) && " · "}Qty {it.quantity}
                          </p>
                        </div>
                        <p>{formatPrice(it.unitPrice * it.quantity)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm font-medium text-charcoal">
                  Your total: {formatPrice(order.total)}
                </p>
              </div>

              <div className="border-t border-charcoal/10 pt-3 text-xs sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <p className="eyebrow mb-1">Ship to</p>
                <p className="text-charcoal">{order.customerName}</p>
                <p className="text-stone">{order.customerPhone}</p>
                <p className="mt-1 text-charcoal/75">{order.address}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
