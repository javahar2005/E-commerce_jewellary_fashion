import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-charcoal/10 bg-beige/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-xl tracking-[0.2em]">VELORA</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone">
              A curated marketplace for fine jewellery and considered fashion,
              made by independent ateliers.
            </p>
          </div>
          <FooterCol
            title="Shop"
            links={[
              ["Shop All", "/products"],
              ["Jewellery", "/products?group=Jewellery"],
              ["Fashion", "/products?group=Fashion"],
              ["New Arrivals", "/products?sort=newest"],
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              ["Sign in", "/login"],
              ["Create account", "/register"],
              ["My orders", "/orders"],
              ["Wishlist", "/wishlist"],
            ]}
          />
          <FooterCol
            title="Sell"
            links={[
              ["Sell on Velora", "/register?role=SELLER"],
              ["Seller dashboard", "/seller"],
            ]}
          />
        </div>
        <div className="mt-14 flex flex-col justify-between gap-2 border-t border-charcoal/10 pt-6 text-xs text-stone sm:flex-row">
          <p>© {new Date().getFullYear()} Velora. All rights reserved.</p>
          <p>Complimentary shipping over $150 · 30-day returns</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-stone hover:text-charcoal">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
