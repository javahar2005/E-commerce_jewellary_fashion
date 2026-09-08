"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Popular / Featured" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get("sort") ?? "newest";

  return (
    <label className="flex items-center gap-2 text-sm text-stone">
      <span className="hidden sm:inline">Sort</span>
      <select
        value={value}
        onChange={(e) => {
          const p = new URLSearchParams(params.toString());
          p.set("sort", e.target.value);
          p.delete("page");
          router.push(`${pathname}?${p.toString()}`);
        }}
        className="h-9 border border-charcoal/20 bg-white px-2 text-sm text-charcoal focus:border-charcoal focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
