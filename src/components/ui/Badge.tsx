import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "sage" | "champagne" | "danger" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em]",
        tone === "neutral" && "bg-beige text-stone",
        tone === "sage" && "bg-sage/15 text-sage-deep",
        tone === "champagne" && "bg-champagne/15 text-[#8a713f]",
        tone === "danger" && "bg-[#b4796a]/15 text-[#8f5748]",
        tone === "outline" && "border border-charcoal/25 text-charcoal",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "neutral" | "sage" | "champagne" | "danger"> = {
    PROCESSING: "champagne",
    SHIPPED: "sage",
    DELIVERED: "sage",
    PENDING: "champagne",
    PAID: "sage",
    FAILED: "danger",
  };
  return (
    <Badge tone={map[status] ?? "neutral"}>{status.toLowerCase()}</Badge>
  );
}
