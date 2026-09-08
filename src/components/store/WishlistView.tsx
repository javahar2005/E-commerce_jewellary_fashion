"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { formatPrice, discountedPrice } from "@/lib/utils";
import { EmptyState } from "@/components/ui/States";

type Item = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  storeName: string;
  price: number;
  discount: number;
  stock: number;
};

export function WishlistView({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  async function remove(productId: string) {
    setBusy(productId);
    const res = await api(`/api/wishlist/${productId}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setItems((x) => x.filter((i) => i.productId !== productId));
    router.refresh();
  }

  async function move(productId: string) {
    setBusy(productId);
    const res = await api(`/api/wishlist/${productId}/move-to-cart`, { method: "POST" });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setItems((x) => x.filter((i) => i.productId !== productId));
    toast.success("Moved to bag");
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Tap the heart on any piece to save it here."
        actionHref="/products"
        actionLabel="Browse pieces"
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => {
        const final = discountedPrice(i.price, i.discount);
        return (
          <li key={i.productId} className="border border-charcoal/10 bg-white">
            <Link href={`/products/${i.slug}`} className="block aspect-[4/5] overflow-hidden bg-beige">
              {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
            </Link>
            <div className="p-4">
              <p className="text-[0.7rem] uppercase tracking-[0.14em] text-stone">{i.storeName}</p>
              <Link href={`/products/${i.slug}`} className="font-serif text-base text-charcoal">
                {i.name}
              </Link>
              <p className="mt-1 text-sm text-charcoal">
                {i.discount > 0 ? (
                  <>
                    <span className="mr-2 text-stone line-through">{formatPrice(i.price)}</span>
                    {formatPrice(final)}
                  </>
                ) : (
                  formatPrice(i.price)
                )}
              </p>
              {i.stock <= 0 && <p className="mt-1 text-xs text-[#8f5748]">Out of stock</p>}
              <div className="mt-4 flex gap-2">
                <button
                  disabled={busy === i.productId || i.stock <= 0}
                  onClick={() => move(i.productId)}
                  className="flex-1 bg-charcoal py-2 text-xs text-ivory disabled:opacity-40"
                >
                  Move to bag
                </button>
                <button
                  disabled={busy === i.productId}
                  onClick={() => remove(i.productId)}
                  className="border border-charcoal/25 px-3 py-2 text-xs hover:bg-beige"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
