"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/components/account/AddressManager";

type Line = {
  id: string;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  lineTotal: number;
};
type Cart = { lines: Line[]; subtotal: number; shipping: number; total: number };

export function CheckoutClient({
  cart,
  addresses,
  stripeConfigured,
  canceled,
}: {
  cart: Cart;
  addresses: Address[];
  stripeConfigured: boolean;
  canceled: boolean;
}) {
  const [addressId, setAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [loading, setLoading] = useState(false);

  async function pay() {
    if (!addressId) return toast.error("Select a shipping address");
    setLoading(true);
    const res = await api<{ url: string }>("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ addressId }),
    });
    if (!res.ok) {
      setLoading(false);
      toast.error(res.error);
      return;
    }
    window.location.href = res.data.url;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        {canceled && (
          <div className="border border-champagne/50 bg-champagne/10 px-4 py-3 text-sm text-[#8a713f]">
            Your payment was cancelled. Your bag has been kept — you can try again below.
          </div>
        )}

        <section>
          <h2 className="mb-4 font-serif text-xl text-charcoal">Shipping address</h2>
          {addresses.length === 0 ? (
            <div className="border border-charcoal/15 bg-white p-5 text-sm">
              <p className="text-stone">You don't have a saved address yet.</p>
              <Link href="/account" className="link-underline mt-2 inline-block text-charcoal">
                Add an address
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer gap-3 border p-4 text-sm transition-colors ${
                    addressId === a.id ? "border-charcoal bg-white" : "border-charcoal/15 bg-white/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === a.id}
                    onChange={() => setAddressId(a.id)}
                    className="mt-1 h-4 w-4 accent-charcoal"
                  />
                  <span>
                    <span className="font-medium text-charcoal">{a.fullName}</span>
                    {a.isDefault && (
                      <span className="ml-2 text-[0.6rem] uppercase tracking-[0.14em] text-sage-deep">
                        Default
                      </span>
                    )}
                    <br />
                    <span className="text-charcoal/75">
                      {a.line1}, {a.city}, {a.state} {a.postalCode}, {a.country}
                    </span>
                    <br />
                    <span className="text-stone">{a.phone}</span>
                  </span>
                </label>
              ))}
              <Link href="/account" className="inline-block text-xs text-stone underline hover:text-charcoal">
                Manage addresses
              </Link>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-serif text-xl text-charcoal">Order summary</h2>
          <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
            {cart.lines.map((l) => (
              <li key={l.id} className="flex gap-4 py-4">
                <div className="h-20 w-16 shrink-0 overflow-hidden bg-beige">
                  {l.image && <img src={l.image} alt={l.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 justify-between text-sm">
                  <div>
                    <p className="font-serif text-charcoal">{l.name}</p>
                    <p className="mt-1 text-xs text-stone">
                      {[l.size, l.color].filter(Boolean).join(" · ")}
                      {" · "}Qty {l.quantity}
                    </p>
                  </div>
                  <p>{formatPrice(l.lineTotal)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="h-fit border border-charcoal/10 bg-white p-6 lg:sticky lg:top-24">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone">Subtotal</dt>
            <dd>{formatPrice(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone">Shipping</dt>
            <dd>{cart.shipping === 0 ? "Complimentary" : formatPrice(cart.shipping)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-charcoal/10 pt-3 text-base">
            <dt>Total</dt>
            <dd>{formatPrice(cart.total)}</dd>
          </div>
        </dl>

        {!stripeConfigured && (
          <p className="mt-4 border border-[#b4796a]/40 bg-[#b4796a]/10 px-3 py-2 text-xs text-[#8f5748]">
            Stripe test keys are not configured. Add them to <code>.env</code> to enable payment.
          </p>
        )}

        <Button
          className="mt-5 w-full"
          onClick={pay}
          disabled={loading || !addressId || !stripeConfigured}
        >
          {loading ? "Redirecting to Stripe…" : "Pay with Stripe"}
        </Button>
        <p className="mt-3 text-center text-xs text-stone">
          Test card 4242 4242 4242 4242 · any future date · any CVC
        </p>
      </aside>
    </div>
  );
}
