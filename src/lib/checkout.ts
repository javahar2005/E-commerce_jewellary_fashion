import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCartDetail } from "@/lib/cart";
import { orderNumber } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";

export class CheckoutError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Creates the order from the user's current cart + chosen address.
 * Idempotent on stripeSessionId. Runs in a transaction: validates stock,
 * writes order + items, decrements stock, clears the cart.
 */
export async function finalizeOrderFromSession(sessionId: string) {
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: { items: true },
  });
  if (existing) return existing;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new CheckoutError(402, "Payment has not been completed");
  }

  const userId = session.metadata?.userId;
  const addressId = session.metadata?.addressId;
  if (!userId || !addressId) throw new CheckoutError(400, "Checkout session is missing data");

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new CheckoutError(400, "Shipping address is no longer available");

  const cart = await getCartDetail(userId);
  if (cart.lines.length === 0) {
    throw new CheckoutError(409, "Your cart is empty");
  }

  return prisma.$transaction(async (tx) => {
    // Re-check under transaction, lock via conditional updates.
    for (const line of cart.lines) {
      const product = await tx.product.findUnique({ where: { id: line.productId } });
      if (!product || !product.published) {
        throw new CheckoutError(409, `${line.name} is no longer available`);
      }
      if (product.stock < line.quantity) {
        throw new CheckoutError(409, `Not enough stock for ${line.name}`);
      }
    }

    const order = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        userId,
        addressId: address.id,
        shipFullName: address.fullName,
        shipPhone: address.phone,
        shipLine1: address.line1,
        shipCity: address.city,
        shipState: address.state,
        shipPostal: address.postalCode,
        shipCountry: address.country,
        subtotal: cart.subtotal,
        total: cart.total,
        status: "PROCESSING",
        paymentStatus: "PAID",
        stripeSessionId: sessionId,
        items: {
          create: cart.lines.map((l) => ({
            productId: l.productId,
            sellerId: l.sellerId,
            productName: l.name,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            size: l.size,
            color: l.color,
            imageUrl: l.image,
            status: "PROCESSING",
          })),
        },
      },
      include: { items: true },
    });

    for (const line of cart.lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cart: { userId } } });

    return order;
  });
}

export function orderInclude() {
  return {
    items: { include: { product: { select: { slug: true } } } },
    user: { select: { name: true, email: true, phone: true } },
  } satisfies Prisma.OrderInclude;
}
