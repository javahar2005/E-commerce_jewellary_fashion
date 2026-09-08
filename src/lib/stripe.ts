import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Add your Stripe TEST secret key to .env.",
    );
  }
  if (!cached) {
    cached = new Stripe(key);
  }
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function appUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}
