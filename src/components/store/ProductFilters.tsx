"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatPrice, cn } from "@/lib/utils";

type Category = { name: string; slug: string; group: string };
type Facets = { sizes: string[]; colors: string[]; minPrice: number; maxPrice: number };

export function ProductFilters({
  categories,
  facets,
}: {
  categories: Category[];
  facets: Facets;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  function update(mut: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(params.toString());
    mut(p);
    p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  }

  const current = {
    category: params.get("category") ?? "",
    group: params.get("group") ?? "",
    size: params.get("size") ?? "",
    color: params.get("color") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    inStock: params.get("inStock") === "1",
    discounted: params.get("discounted") === "1",
  };

  const activeCount = Object.values(current).filter((v) => Boolean(v)).length;

  const body = (
    <div className="space-y-8">
      <FilterGroup title="Category">
        <div className="space-y-1.5">
          <RadioRow
            label="All categories"
            active={!current.category && !current.group}
            onClick={() =>
              update((p) => {
                p.delete("category");
                p.delete("group");
              })
            }
          />
          {["Jewellery", "Fashion"].map((g) => (
            <div key={g}>
              <RadioRow
                label={`All ${g}`}
                active={current.group === g && !current.category}
                onClick={() =>
                  update((p) => {
                    p.set("group", g);
                    p.delete("category");
                  })
                }
              />
              <div className="ml-3 space-y-1 border-l border-charcoal/10 pl-3">
                {categories
                  .filter((c) => c.group === g)
                  .map((c) => (
                    <RadioRow
                      key={c.slug}
                      label={c.name}
                      active={current.category === c.slug}
                      onClick={() =>
                        update((p) => {
                          p.set("category", c.slug);
                          p.delete("group");
                        })
                      }
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            update((p) => {
              const min = String(fd.get("min") ?? "");
              const max = String(fd.get("max") ?? "");
              if (min) p.set("minPrice", String(Number(min) * 100));
              else p.delete("minPrice");
              if (max) p.set("maxPrice", String(Number(max) * 100));
              else p.delete("maxPrice");
            });
          }}
        >
          <input
            name="min"
            type="number"
            min={0}
            placeholder={String(Math.floor(facets.minPrice / 100))}
            defaultValue={current.minPrice ? Number(current.minPrice) / 100 : ""}
            className="h-9 w-full border border-charcoal/20 bg-white px-2 text-sm"
          />
          <span className="text-stone">–</span>
          <input
            name="max"
            type="number"
            min={0}
            placeholder={String(Math.ceil(facets.maxPrice / 100))}
            defaultValue={current.maxPrice ? Number(current.maxPrice) / 100 : ""}
            className="h-9 w-full border border-charcoal/20 bg-white px-2 text-sm"
          />
          <button className="h-9 shrink-0 border border-charcoal px-3 text-xs">Go</button>
        </form>
        <p className="mt-2 text-xs text-stone">
          Range {formatPrice(facets.minPrice)} – {formatPrice(facets.maxPrice)}
        </p>
      </FilterGroup>

      {facets.sizes.length > 0 && (
        <FilterGroup title="Size">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((sz) => (
              <Chip
                key={sz}
                label={sz}
                active={current.size === sz}
                onClick={() =>
                  update((p) => {
                    if (current.size === sz) p.delete("size");
                    else p.set("size", sz);
                  })
                }
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {facets.colors.length > 0 && (
        <FilterGroup title="Color">
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((c) => (
              <Chip
                key={c}
                label={c}
                active={current.color === c}
                onClick={() =>
                  update((p) => {
                    if (current.color === c) p.delete("color");
                    else p.set("color", c);
                  })
                }
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Availability">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={current.inStock}
              onChange={(e) =>
                update((p) => {
                  if (e.target.checked) p.set("inStock", "1");
                  else p.delete("inStock");
                })
              }
              className="h-4 w-4 accent-charcoal"
            />
            In stock only
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={current.discounted}
              onChange={(e) =>
                update((p) => {
                  if (e.target.checked) p.set("discounted", "1");
                  else p.delete("discounted");
                })
              }
              className="h-4 w-4 accent-charcoal"
            />
            On sale only
          </label>
        </div>
      </FilterGroup>

      {activeCount > 0 && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-stone underline hover:text-charcoal"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="mb-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="border border-charcoal/25 px-4 py-2 text-xs tracking-wide"
        >
          Filters{activeCount ? ` (${activeCount})` : ""}
        </button>
      </div>

      <aside className="hidden lg:block">{body}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal/30" onClick={() => setOpen(false)} />
          <div className="thin-scroll absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-ivory p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-serif text-xl">Filters</p>
              <button onClick={() => setOpen(false)} className="text-stone">
                ✕
              </button>
            </div>
            {body}
            <button
              onClick={() => setOpen(false)}
              className="mt-8 w-full bg-charcoal py-3 text-sm text-ivory"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      {children}
    </div>
  );
}

function RadioRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block text-left text-sm transition-colors",
        active ? "text-charcoal" : "text-stone hover:text-charcoal",
      )}
    >
      {active && <span className="mr-1.5">•</span>}
      {label}
    </button>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border px-3 py-1 text-xs transition-colors",
        active
          ? "border-charcoal bg-charcoal text-ivory"
          : "border-charcoal/25 text-charcoal hover:border-charcoal",
      )}
    >
      {label}
    </button>
  );
}
