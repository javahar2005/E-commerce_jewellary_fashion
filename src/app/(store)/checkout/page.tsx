import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCartDetail } from "@/lib/cart";
import { isStripeConfigured } from "@/lib/stripe";
import { CheckoutClient } from "@/components/store/CheckoutClient";
import { EmptyState } from "@/components/ui/States";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const user = await requireRole("CUSTOMER");
  const { canceled } = await searchParams;
  const [cart, addresses] = await Promise.all([
    getCartDetail(user.id),
    prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Nothing to check out"
          description="Your bag is empty."
          actionHref="/products"
          actionLabel="Browse pieces"
        />
      </div>
    );
  }

  if (cart.hasBlockingIssues) redirect("/cart");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow mb-2">Checkout</p>
      <h1 className="mb-8 font-serif text-3xl text-charcoal sm:text-4xl">Review &amp; pay</h1>
      <CheckoutClient
        cart={cart}
        addresses={addresses}
        stripeConfigured={isStripeConfigured()}
        canceled={canceled === "1"}
      />
    </div>
  );
}
