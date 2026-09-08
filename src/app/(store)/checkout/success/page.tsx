import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { finalizeOrderFromSession, CheckoutError } from "@/lib/checkout";
import { formatPrice } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  await requireRole("CUSTOMER");
  const { session_id } = await searchParams;

  if (!session_id) {
    return <Failed message="Missing checkout session." />;
  }

  let order;
  try {
    order = await finalizeOrderFromSession(session_id);
  } catch (e) {
    const message =
      e instanceof CheckoutError ? e.message : "We couldn't confirm this order. Please contact support.";
    return <Failed message={message} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-sage text-sage-deep">
        ✓
      </div>
      <p className="eyebrow mb-2">Thank you</p>
      <h1 className="font-serif text-3xl text-charcoal">Your order is confirmed</h1>
      <p className="mt-3 text-sm text-stone">
        Order <span className="text-charcoal">{order.orderNumber}</span> · Total{" "}
        {formatPrice(order.total)}
      </p>

      <div className="mt-8 border-y border-charcoal/10 py-6 text-left">
        <ul className="space-y-3 text-sm">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span className="text-charcoal">
                {it.productName}{" "}
                <span className="text-stone">× {it.quantity}</span>
              </span>
              <span>{formatPrice(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-stone">
          Shipping to {order.shipFullName}, {order.shipLine1}, {order.shipCity}, {order.shipState}{" "}
          {order.shipPostal}
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href={`/orders/${order.id}`}>View order</ButtonLink>
        <ButtonLink href="/products" variant="outline">
          Continue shopping
        </ButtonLink>
      </div>
    </div>
  );
}

function Failed({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="eyebrow mb-2">Payment</p>
      <h1 className="font-serif text-2xl text-charcoal">We couldn't confirm your order</h1>
      <p className="mt-3 text-sm text-stone">{message}</p>
      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink href="/cart" variant="outline">
          Back to bag
        </ButtonLink>
        <Link href="/orders" className="link-underline self-center text-sm text-charcoal">
          View my orders
        </Link>
      </div>
    </div>
  );
}
