/**
 * Simple delivery estimate: a dispatch + transit window measured in business
 * days from "now". No configuration — one window for the whole marketplace.
 */
export const DISPATCH_BUSINESS_DAYS = 3;
export const TRANSIT_MIN_BUSINESS_DAYS = 2;
export const TRANSIT_MAX_BUSINESS_DAYS = 6;

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return d;
}

export type DeliveryWindow = {
  earliest: Date;
  latest: Date;
  minDays: number;
  maxDays: number;
};

export function estimateDelivery(from: Date = new Date()): DeliveryWindow {
  const earliest = addBusinessDays(from, DISPATCH_BUSINESS_DAYS + TRANSIT_MIN_BUSINESS_DAYS);
  const latest = addBusinessDays(from, DISPATCH_BUSINESS_DAYS + TRANSIT_MAX_BUSINESS_DAYS);
  return {
    earliest,
    latest,
    minDays: DISPATCH_BUSINESS_DAYS + TRANSIT_MIN_BUSINESS_DAYS,
    maxDays: DISPATCH_BUSINESS_DAYS + TRANSIT_MAX_BUSINESS_DAYS,
  };
}

const fmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

export function formatDeliveryWindow(w: DeliveryWindow): string {
  return `${fmt.format(w.earliest)} – ${fmt.format(w.latest)}`;
}
