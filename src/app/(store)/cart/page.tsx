import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getCartDetail } from "@/lib/cart";
import { CartView } from "@/components/store/CartView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Bag" };

export default async function CartPage() {
  const user = await requireRole("CUSTOMER");
  const cart = await getCartDetail(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow mb-2">Checkout</p>
      <h1 className="mb-8 font-serif text-3xl text-charcoal sm:text-4xl">Your bag</h1>
      <CartView initial={cart} />
    </div>
  );
}
