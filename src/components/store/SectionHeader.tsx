import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = "View all",
  align = "row",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  align?: "row" | "center";
}) {
  if (align === "center") {
    return (
      <div className="mb-10 flex flex-col items-center text-center">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="max-w-2xl font-serif text-2xl text-charcoal sm:text-[2rem]">{title}</h2>
        {subtitle && <p className="mt-3 max-w-md text-sm text-stone">{subtitle}</p>}
        {href && (
          <Link
            href={href}
            className="cta-link group mt-5 inline-flex items-center gap-2 text-sm tracking-wide text-charcoal/80 transition-colors hover:text-charcoal"
          >
            {linkLabel}
            <span className="cta-arrow" aria-hidden>→</span>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={cn("mb-8 flex gap-4", subtitle ? "items-start" : "items-end", "justify-between")}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-md text-sm text-stone">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="cta-link group mt-1 inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm tracking-wide text-charcoal/80 transition-colors hover:text-charcoal"
        >
          {linkLabel}
          <span className="cta-arrow" aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
