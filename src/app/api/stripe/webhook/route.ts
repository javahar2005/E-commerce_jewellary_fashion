import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { finalizeOrderFromSession } from "@/lib/checkout";

// Optional: only active when STRIPE_WEBHOOK_SECRET is configured.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Webhook not configured", { status: 501 });
  }

  const sig = req.headers.get("stripe-signature");
  const payload = await req.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, sig ?? "", secret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string };
    try {
      await finalizeOrderFromSession(session.id);
    } catch (err) {
      console.error("[stripe webhook] finalize failed:", err);
      return new Response("Finalize failed", { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
}
