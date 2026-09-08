import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productCardSelect } from "@/lib/products";
import { getWishlistedIds } from "@/lib/viewer";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeader } from "@/components/store/SectionHeader";
import { RecentlyViewedRail } from "@/components/store/RecentlyViewedRail";
import { Hero } from "@/components/store/Hero";
import { EditCarousel, type EditSlide } from "@/components/store/EditCarousel";
import { Reveal } from "@/components/store/Reveal";

export const dynamic = "force-dynamic";

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

async function pick(where: Prisma.ProductWhereInput, take = 4) {
  return prisma.product.findMany({
    where: { published: true, ...where },
    select: productCardSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
}

const EDIT_SLIDES: EditSlide[] = [
  {
    index: "01",
    label: "Jewellery",
    title: "Gold, silver and stones, set by hand",
    copy: "Fine pieces from independent ateliers, made in small batches.",
    href: "/products?group=Jewellery",
    image: U("photo-1599643478518-a784e5dc4c8f", 1600),
  },
  {
    index: "02",
    label: "Fashion",
    title: "Natural fibres, timeless silhouettes",
    copy: "Considered clothing in linen, wool and organic cotton.",
    href: "/products?group=Fashion",
    image: U("photo-1490481651871-ab68de25d43d", 1600),
  },
  {
    index: "03",
    label: "New Season",
    title: "The latest arrivals, freshly listed",
    copy: "The newest work from the makers on Velora.",
    href: "/products?sort=newest",
    image: U("photo-1441984904996-e0b6ba687e04", 1600),
  },
  {
    index: "04",
    label: "Statement Pieces",
    title: "For the moments you want to be remembered",
    copy: "Bolder forms and rare materials, chosen to stand out.",
    href: "/products?sort=popular",
    image: U("photo-1617038220319-276d3cfab638", 1600),
  },
];

export default async function HomePage() {
  const [featured, newArrivals, bestSellers, trending, discounted, wishlisted] =
    await Promise.all([
      pick({ featured: true }),
      pick({ newArrival: true }, 8),
      pick({ bestSeller: true }, 3),
      pick({ trending: true }, 3),
      pick({ discount: { gt: 0 } }, 4),
      getWishlistedIds(),
    ]);

  const veloraEdit = (featured.length ? featured : await pick({}, 4)).slice(0, 4);
  const mostLoved = (bestSellers.length ? bestSellers : trending.length ? trending : featured).slice(
    0,
    3,
  );
  const arrivals = (newArrivals.length ? newArrivals : await pick({}, 4)).slice(0, 4);

  return (
    <div className="overflow-x-hidden">
      <Hero />

      {/* THE EDIT — editorial carousel */}
      <section id="the-edit" className="bg-ivory py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <EditCarousel slides={EDIT_SLIDES} />
          </Reveal>
        </div>
      </section>

      {/* THE VELORA EDIT — featured products */}
      <section id="velora-edit" className="bg-beige py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Featured"
              title="The Velora Edit"
              subtitle="Pieces chosen to become part of your story."
              href="/products"
              linkLabel="View all"
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
            {veloraEdit.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} wishlisted={wishlisted.has(p.id)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL STORY */}
      <section id="story" className="bg-ivory py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-8">
          <Reveal variant="image" className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/2] lg:aspect-[4/5]">
            <img
              src={U("photo-1524805444758-089113d48a6d", 1400)}
              alt="Velora — quiet luxury, thoughtfully chosen"
              className="h-full w-full object-cover"
            />
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow mb-4">Our approach</p>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="font-serif text-3xl leading-tight text-charcoal sm:text-[2.5rem]">
                Quiet luxury, thoughtfully chosen.
              </h2>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-stone">
                Velora brings together distinctive jewellery and fashion from independent
                sellers, making it easier to discover pieces that feel uniquely yours —
                made in small batches, with materials chosen to age well.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <Link
                href="/products"
                className="cta-link group mt-9 inline-flex items-center gap-3 border-b border-charcoal/40 pb-1 text-sm tracking-wide text-charcoal transition-colors hover:border-charcoal"
              >
                Discover Velora
                <span className="cta-arrow" aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section id="new-arrivals" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Just in"
              title="New Arrivals"
              subtitle="The latest pieces worth discovering."
              href="/products?sort=newest"
              linkLabel="View all"
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
            {arrivals.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} wishlisted={wishlisted.has(p.id)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MOST LOVED — differentiated: centred, three larger pieces on a warm panel */}
      {mostLoved.length > 0 && (
        <section id="most-loved" className="bg-ivory py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeader
                align="center"
                eyebrow="Customer favourites"
                title="Most Loved"
                subtitle="Pieces customers keep coming back to."
              />
            </Reveal>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-10 lg:grid-cols-3">
              {mostLoved.map((p, i) => (
                <Reveal
                  key={p.id}
                  delay={i * 90}
                  className={i === 2 ? "col-span-2 mx-auto w-1/2 lg:col-span-1 lg:w-full" : ""}
                >
                  <ProductCard product={p} wishlisted={wishlisted.has(p.id)} />
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-12 text-center">
              <Link
                href="/products?sort=popular"
                className="cta-link group inline-flex items-center gap-2 text-sm tracking-wide text-charcoal/80 transition-colors hover:text-charcoal"
              >
                View all
                <span className="cta-arrow" aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* WORTH A SECOND LOOK — discounted */}
      {discounted.length > 0 && (
        <section id="second-look" className="bg-beige py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeader
                eyebrow="On sale"
                title="Worth a Second Look"
                subtitle="Selected pieces, now at a little less."
                href="/products?discounted=1"
                linkLabel="View all discounts"
              />
            </Reveal>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
              {discounted.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProductCard product={p} wishlisted={wishlisted.has(p.id)} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED — hidden when empty */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RecentlyViewedRail wishlistedIds={[...wishlisted]} />
      </div>
    </div>
  );
}
