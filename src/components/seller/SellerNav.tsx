"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/seller", label: "Dashboard" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/profile", label: "Profile" },
];

export function SellerNav({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const isActive = (href: string) =>
    href === "/seller" ? pathname === "/seller" : pathname.startsWith(href);

  return (
    <div className="border-b border-charcoal/10 bg-white lg:border-b-0 lg:border-r lg:min-h-screen lg:w-60 lg:shrink-0">
      <div className="flex items-center justify-between p-5 lg:block">
        <div>
          <Link href="/" className="font-serif text-xl tracking-[0.2em] text-charcoal">
            VELORA
          </Link>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-stone">
            Seller · {storeName}
          </p>
        </div>
        <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          ☰
        </button>
      </div>
      <nav
        className={cn(
          "flex-col gap-1 px-3 pb-4 lg:flex",
          open ? "flex" : "hidden lg:flex",
        )}
      >
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-[3px] px-3 py-2 text-sm transition-colors",
              isActive(l.href)
                ? "bg-beige text-charcoal"
                : "text-stone hover:bg-beige/60 hover:text-charcoal",
            )}
          >
            {l.label}
          </Link>
        ))}
        <button
          onClick={logout}
          className="mt-2 rounded-[3px] px-3 py-2 text-left text-sm text-stone hover:bg-beige/60 hover:text-charcoal"
        >
          Sign out
        </button>
      </nav>
    </div>
  );
}
