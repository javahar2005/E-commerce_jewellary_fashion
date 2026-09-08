import { cn } from "@/lib/utils";

const STEPS = ["PROCESSING", "SHIPPED", "DELIVERED"] as const;

export function OrderStatusTrail({ status }: { status: string }) {
  const current = STEPS.indexOf(status as (typeof STEPS)[number]);
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((step, i) => (
        <li key={step} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.6rem]",
              i <= current
                ? "border-sage bg-sage/15 text-sage-deep"
                : "border-charcoal/20 text-stone",
            )}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span
            className={cn(
              "text-[0.65rem] uppercase tracking-[0.12em]",
              i <= current ? "text-charcoal" : "text-stone",
            )}
          >
            {step.toLowerCase()}
          </span>
          {i < STEPS.length - 1 && (
            <span
              className={cn(
                "hidden h-px flex-1 sm:block",
                i < current ? "bg-sage" : "bg-charcoal/15",
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
