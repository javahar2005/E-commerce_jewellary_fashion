import { cn } from "@/lib/utils";

function Star({ fill }: { fill: number }) {
  // fill: 0..1 — how much of this star is filled.
  // Deterministic id (identical gradients may safely share one) — keeps SSR and
  // client markup identical so there's no hydration mismatch.
  const pct = Math.round(fill * 100);
  const id = `vl-star-${pct}`;
  return (
    <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0" aria-hidden>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="var(--color-champagne)" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L12 17.77 6.79 20.5l.99-5.8L3.57 9.6l5.82-.85L12 3.5z"
        fill={`url(#${id})`}
        stroke="var(--color-champagne)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Stars({
  value,
  className,
  size = "1rem",
}: {
  value: number;
  className?: string;
  size?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 leading-none text-champagne", className)}
      style={{ fontSize: size }}
      aria-label={`${value} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} fill={Math.max(0, Math.min(1, value - i))} />
      ))}
    </span>
  );
}

export function RatingInline({
  average,
  count,
  href = "#reviews",
}: {
  average: number;
  count: number;
  href?: string;
}) {
  if (count === 0) {
    return (
      <a href={href} className="inline-flex items-center gap-2 text-xs text-stone hover:text-charcoal">
        <Stars value={0} size="0.85rem" />
        No reviews yet
      </a>
    );
  }
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 text-xs text-stone transition-colors hover:text-charcoal"
    >
      <Stars value={average} size="0.85rem" />
      <span className="text-charcoal">{average.toFixed(1)}</span>
      <span>
        ({count} {count === 1 ? "review" : "reviews"})
      </span>
    </a>
  );
}
