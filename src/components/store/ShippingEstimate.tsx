import { estimateDelivery, formatDeliveryWindow } from "@/lib/shipping";

/**
 * Compact delivery + shipping summary shown next to the price / add-to-cart.
 * Rendered on the server so the "current date" is the server's.
 */
export function ShippingEstimate({ inStock }: { inStock: boolean }) {
  const window = estimateDelivery();
  const range = formatDeliveryWindow(window);

  return (
    <div className="border border-charcoal/10 bg-white/60 px-4 py-3.5 text-sm">
      <div className="flex items-start gap-3">
        <TruckIcon />
        <div>
          <p className="text-charcoal">
            Estimated delivery <span className="font-medium">{range}</span>
          </p>
          <p className="mt-0.5 text-xs text-stone">
            {inStock
              ? `In stock — dispatched in 2–4 business days`
              : `Made to order — allow a little longer for dispatch`}
          </p>
        </div>
      </div>
      <div className="mt-2.5 border-t border-charcoal/10 pt-2.5 text-xs text-stone">
        Complimentary shipping on orders over $150, otherwise a flat $9 · 30-day returns on
        unworn pieces
      </div>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="mt-0.5 shrink-0 text-stone"
      aria-hidden
    >
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}
