import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  makeHref,
}: {
  page: number;
  pages: number;
  makeHref: (p: number) => string;
}) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );

  return (
    <nav className="mt-14 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={makeHref(page - 1)} className="px-3 py-2 text-sm text-stone hover:text-charcoal">
          ← Prev
        </Link>
      )}
      {nums.map((n, i) => {
        const prev = nums[i - 1];
        return (
          <span key={n} className="flex items-center gap-1.5">
            {prev && n - prev > 1 && <span className="px-1 text-stone">…</span>}
            <Link
              href={makeHref(n)}
              className={cn(
                "h-9 w-9 place-content-center text-center text-sm",
                n === page
                  ? "bg-charcoal text-ivory"
                  : "border border-charcoal/15 text-charcoal hover:border-charcoal/40",
              )}
            >
              {n}
            </Link>
          </span>
        );
      })}
      {page < pages && (
        <Link href={makeHref(page + 1)} className="px-3 py-2 text-sm text-stone hover:text-charcoal">
          Next →
        </Link>
      )}
    </nav>
  );
}
