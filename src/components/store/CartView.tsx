"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

type Line = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  storeName: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  available: number;
  issue: string | null;
};
type Cart = {
  lines: Line[];
  subtotal: number;
  shipping: number;
  total: number;
  hasBlockingIssues: boolean;
};

const ISSUE_LABEL: Record<string, string> = {
  unavailable: "No longer available",
  out_of_stock: "Out of stock",
  insufficient: "Not enough stock",
};

export function CartView({ initial }: { initial: Cart }) {
  const [cart, setCart] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  async function change(id: string, quantity: number) {
    if (quantity < 1) return;
    setBusy(id);
    const res = await api<Cart>(`/api/cart/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setCart(res.data);
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(id);
    const res = await api<Cart>(`/api/cart/${id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setCart(res.data);
    toast.success("Removed from bag");
    router.refresh();
  }

  if (cart.lines.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Discover pieces from our independent makers."
        actionHref="/products"
        actionLabel="Start shopping"
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
        {cart.lines.map((l) => (
          <li key={l.id} className="flex gap-4 py-6">
            <Link
              href={`/products/${l.slug}`}
              className="relative h-28 w-24 shrink-0 overflow-hidden bg-beige"
            >
              {l.image && <img src={l.image} alt={l.name} className="h-full w-full object-cover" />}
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.14em] text-stone">
                    {l.storeName}
                  </p>
                  <Link
                    href={`/products/${l.slug}`}
                    className="font-serif text-base text-charcoal hover:text-stone"
                  >
                    {l.name}
                  </Link>
                  <p className="mt-1 text-xs text-stone">
                    {[l.size, l.color].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p className="text-sm text-charcoal">{formatPrice(l.lineTotal)}</p>
              </div>

              {l.issue && (
                <p className="mt-1 text-xs text-[#8f5748]">
                  {ISSUE_LABEL[l.issue]}
                  {l.issue === "insufficient" && ` — ${l.available} available`}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex items-center border border-charcoal/25">
                  <button
                    disabled={busy === l.id || l.quantity <= 1}
                    onClick={() => change(l.id, l.quantity - 1)}
                    className="h-8 w-8 text-stone hover:text-charcoal disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{l.quantity}</span>
                  <button
                    disabled={busy === l.id || l.quantity >= l.available}
                    onClick={() => change(l.id, l.quantity + 1)}
                    className="h-8 w-8 text-stone hover:text-charcoal disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => remove(l.id)}
                  disabled={busy === l.id}
                  className="text-xs text-stone underline hover:text-charcoal"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit border border-charcoal/10 bg-white p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-xl">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
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

        {cart.hasBlockingIssues && (
          <p className="mt-4 border border-[#b4796a]/40 bg-[#b4796a]/10 px-3 py-2 text-xs text-[#8f5748]">
            Please resolve the flagged items before checking out.
          </p>
        )}

        {cart.hasBlockingIssues ? (
          <Button className="mt-5 w-full" disabled>
            Proceed to checkout
          </Button>
        ) : (
          <ButtonLink href="/checkout" className="mt-5 w-full">
            Proceed to checkout
          </ButtonLink>
        )}
        <Link
          href="/products"
          className="mt-3 block text-center text-xs text-stone hover:text-charcoal"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
