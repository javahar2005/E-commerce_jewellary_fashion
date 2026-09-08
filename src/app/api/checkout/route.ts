import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRole, errorResponse, json, ApiError } from "@/lib/api";
import { checkoutSchema } from "@/lib/validations";
import { getCartDetail } from "@/lib/cart";
import { getStripe, isStripeConfigured, appUrl } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const user = await authRole("CUSTOMER");
    const { addressId } = checkoutSchema.parse(await req.json());

    if (!isStripeConfigured()) {
      throw new ApiError(
        503,
        "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment.",
      );
    }

    const address = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
    if (!address) throw new ApiError(400, "Select a valid shipping address");

    const cart = await getCartDetail(user.id);
    if (cart.lines.length === 0) throw new ApiError(409, "Your cart is empty");
    if (cart.hasBlockingIssues) {
      throw new ApiError(409, "Some items in your cart are unavailable. Please review your bag.");
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        ...cart.lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: "usd",
            unit_amount: l.unitPrice,
            product_data: {
              name: l.name,
              description: [l.size, l.color].filter(Boolean).join(" · ") || undefined,
            },
          },
        })),
        ...(cart.shipping > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "usd",
                  unit_amount: cart.shipping,
                  product_data: { name: "Shipping" },
                },
              },
            ]
          : []),
      ],
      metadata: { userId: user.id, addressId: address.id },
      success_url: appUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: appUrl("/checkout?canceled=1"),
    });

    return json({ url: session.url });
  } catch (e) {
    return errorResponse(e);
  }
}
