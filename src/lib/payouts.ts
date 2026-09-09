import "server-only";
import { prisma } from "@/lib/prisma";

/** Marketplace commission taken from each sale (demo value). */
export const COMMISSION_RATE = 0.1; // 10%

export type SellerEarnings = {
  totalSales: number; // minor units
  commission: number; // minor units
  earnings: number; // minor units
  paidOrders: number;
};

/** Earnings summary from the seller's PAID order items. */
export async function getSellerEarnings(sellerId: string): Promise<SellerEarnings> {
  const items = await prisma.orderItem.findMany({
    where: { sellerId, order: { paymentStatus: "PAID" } },
    select: { unitPrice: true, quantity: true, orderId: true },
  });

  const totalSales = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const commission = Math.round(totalSales * COMMISSION_RATE);
  const earnings = totalSales - commission;
  const paidOrders = new Set(items.map((i) => i.orderId)).size;

  return { totalSales, commission, earnings, paidOrders };
}

/** Masked bank account number for display, e.g. "•••• •••• 3456". */
export function maskAccountNumber(value: string | null | undefined): string {
  if (!value) return "";
  const digits = value.replace(/\s+/g, "");
  const last4 = digits.slice(-4);
  return `•••• •••• ${last4}`;
}
