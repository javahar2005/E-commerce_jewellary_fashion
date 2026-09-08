"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/lib/client";
import { SearchBox } from "./SearchBox";

type Cat = { name: string; slug: string; group: string };

export function NavbarClient({
  session,
  counts,
  categories,
}: {
  session: { name: string; role: string } | null;
  counts: { cart: number; wishlist: number };
  categories: Cat[];
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  // Close overlays whenever the route changes.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setOpen(false);
    setSearchOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  const jewellery = categories.filter((c) => c.group === "Jewellery");
  const fashion = categories.filter((c) => c.group === "Fashion");

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const isCustomer = !session || session.role === "CUSTOMER";
  const homeActive = pathname === "/";
  const shopActive = pathname.startsWith("/products");

  // Homepage only: the navbar starts transparent over the hero, then fades to
  // the standard solid style once the user scrolls. Every other route keeps the
  // existing sticky solid navbar untouched.
  const overlay = homeActive;
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!overlay) return;
    let raf = 0;
    const update = () => setScrolled(window.scrollY > 24);
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [overlay]);

  const solid = !overlay || scrolled || searchOpen;

  return (
    <>
    <header
      data-overlay={overlay && !solid}
      className={cn(
        "inset-x-0 top-0 z-50",
        overlay ? "fixed" : "sticky",
        overlay && "transition-[background-color,border-color,backdrop-filter] duration-500 ease-out",
        solid
          ? "border-b border-charcoal/10 bg-ivory/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[68px] lg:px-8">
        {/* Mobile menu button */}
        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="nav-fg -ml-1 flex h-10 w-10 items-center justify-center text-charcoal lg:hidden"
        >
          <MenuIcon open={open} />
        </button>

        {/* Logo — always links home */}
        <Link
          href="/"
          aria-label="Velora — home"
          className="nav-fg font-serif text-2xl tracking-[0.22em] text-charcoal transition-opacity hover:opacity-70 lg:text-[1.55rem]"
        >
          VELORA
        </Link>

        {/* Desktop nav */}
        <nav className="ml-8 hidden items-center gap-9 lg:flex">
          <Link href="/" data-active={homeActive} className="nav-link text-sm tracking-wide">
            Home
          </Link>
          <Link href="/products" data-active={shopActive} className="nav-link text-sm tracking-wide">
            Shop
          </Link>

          {/* Categories dropdown */}
          <div className="group relative">
            <button className="nav-link flex items-center gap-1 text-sm tracking-wide">
              Categories
              <span className="text-[0.6rem] text-stone transition-transform group-hover:rotate-180">
                ▾
              </span>
            </button>
            <div className="invisible absolute left-1/2 top-full z-20 w-[420px] -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-6 border border-charcoal/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(41,40,36,0.4)]">
                <CatColumn title="Jewellery" cats={jewellery} allHref="/products?group=Jewellery" />
                <CatColumn title="Fashion" cats={fashion} allHref="/products?group=Fashion" />
              </div>
            </div>
          </div>

          <Link href="/products?sort=newest" className="nav-link text-sm tracking-wide">
            New Arrivals
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <IconButton label="Search" onClick={() => setSearchOpen((v) => !v)}>
            <SearchIcon />
          </IconButton>

          {isCustomer && (
            <>
              <IconLink href="/wishlist" label="Wishlist" badge={counts.wishlist}>
                <HeartIcon />
              </IconLink>
              <IconLink href="/cart" label="Cart" badge={counts.cart}>
                <BagIcon />
              </IconLink>
            </>
          )}

          {session ? (
            <div className="group relative hidden sm:block">
              <button className="nav-fg flex h-10 items-center gap-1.5 px-2 text-sm text-charcoal/75 transition-colors hover:text-charcoal">
                <UserIcon />
                <span className="hidden max-w-[8rem] truncate lg:inline">
                  {session.name.split(" ")[0]}
                </span>
              </button>
              <div className="invisible absolute right-0 top-full w-48 pt-2 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100">
                <div className="border border-charcoal/10 bg-white py-1 shadow-[0_20px_50px_-30px_rgba(41,40,36,0.4)]">
                  <MenuLink href="/">Home</MenuLink>
                  {session.role === "CUSTOMER" && (
                    <>
                      <MenuLink href="/account">My Account</MenuLink>
                      <MenuLink href="/orders">My Orders</MenuLink>
                      <MenuLink href="/wishlist">Wishlist</MenuLink>
                    </>
                  )}
                  {session.role === "SELLER" && <MenuLink href="/seller">Seller Dashboard</MenuLink>}
                  {session.role === "ADMIN" && <MenuLink href="/admin">Admin Dashboard</MenuLink>}
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-sm text-charcoal/75 transition-colors hover:bg-beige hover:text-charcoal"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="nav-fg hidden px-2 text-sm tracking-wide text-charcoal/75 transition-colors hover:text-charcoal sm:block"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-charcoal/10 bg-ivory px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <SearchBox
              isCustomer={!!session && session.role === "CUSTOMER"}
              autoFocus
              onNavigate={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}

    </header>

      {/* Mobile drawer — sibling of <header> so the header's backdrop-filter
          doesn't trap this fixed element in a smaller containing block. */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-charcoal/30 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute left-0 top-0 flex h-full w-[84%] max-w-sm flex-col overflow-y-auto bg-ivory p-6 shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="font-serif text-xl tracking-[0.22em] text-charcoal">
              VELORA
            </Link>
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-1 text-stone">
              <MenuIcon open />
            </button>
          </div>

          <nav className="flex flex-col">
            <DrawerLink href="/" active={homeActive}>Home</DrawerLink>
            <DrawerLink href="/products" active={pathname === "/products"}>Shop all</DrawerLink>
            <DrawerLink href="/products?sort=newest">New arrivals</DrawerLink>
            <DrawerLink href="/products?discounted=1">On sale</DrawerLink>

            <p className="eyebrow mb-1 mt-6">Jewellery</p>
            {jewellery.map((c) => (
              <DrawerLink key={c.slug} href={`/products?category=${c.slug}`} small>
                {c.name}
              </DrawerLink>
            ))}
            <p className="eyebrow mb-1 mt-5">Fashion</p>
            {fashion.map((c) => (
              <DrawerLink key={c.slug} href={`/products?category=${c.slug}`} small>
                {c.name}
              </DrawerLink>
            ))}
          </nav>

          <div className="mt-6 border-t border-charcoal/10 pt-4">
            {session ? (
              <>
                {session.role === "CUSTOMER" && (
                  <>
                    <DrawerLink href="/account">My account</DrawerLink>
                    <DrawerLink href="/orders">My orders</DrawerLink>
                    <DrawerLink href="/wishlist">Wishlist</DrawerLink>
                  </>
                )}
                {session.role === "SELLER" && <DrawerLink href="/seller">Seller dashboard</DrawerLink>}
                {session.role === "ADMIN" && <DrawerLink href="/admin">Admin dashboard</DrawerLink>}
                <button onClick={logout} className="mt-1 block py-2.5 text-sm text-charcoal/75">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <DrawerLink href="/login">Sign in</DrawerLink>
                <DrawerLink href="/register">Create account</DrawerLink>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CatColumn({
  title,
  cats,
  allHref,
}: {
  title: string;
  cats: Cat[];
  allHref: string;
}) {
  return (
    <div>
      <Link href={allHref} className="eyebrow mb-3 block transition-colors hover:text-charcoal">
        {title}
      </Link>
      <ul className="space-y-1.5">
        {cats.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/products?category=${c.slug}`}
              className="text-sm text-stone transition-colors hover:text-charcoal"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="nav-fg flex h-10 w-10 items-center justify-center text-charcoal/75 transition-colors hover:text-charcoal"
    >
      {children}
    </button>
  );
}

function IconLink({
  href,
  label,
  badge,
  children,
}: {
  href: string;
  label: string;
  badge: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={badge > 0 ? `${label} (${badge})` : label}
      className="nav-fg relative flex h-10 w-10 items-center justify-center text-charcoal/75 transition-colors hover:text-charcoal"
    >
      {children}
      {badge > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[0.6rem] font-medium text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-charcoal/75 transition-colors hover:bg-beige hover:text-charcoal"
    >
      {children}
    </Link>
  );
}

function DrawerLink({
  href,
  children,
  small,
  active,
}: {
  href: string;
  children: React.ReactNode;
  small?: boolean;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block border-b border-charcoal/5 py-2.5",
        small ? "text-sm text-stone" : "text-[0.95rem] text-charcoal/85",
        active && "text-charcoal",
      )}
    >
      {children}
      {active && <span className="ml-2 text-champagne">•</span>}
    </Link>
  );
}

/* icons */
const s = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
} as const;
function SearchIcon() {
  return (
    <svg {...s}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg {...s}>
      <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg {...s}>
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg {...s}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg {...s} width={22} height={22}>
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}
