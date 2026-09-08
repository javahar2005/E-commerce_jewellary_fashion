"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Profile & addresses" },
  { href: "/orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-8 flex gap-6 border-b border-charcoal/10 text-sm">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "-mb-px border-b-2 pb-3 transition-colors",
              active
                ? "border-charcoal text-charcoal"
                : "border-transparent text-stone hover:text-charcoal",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
