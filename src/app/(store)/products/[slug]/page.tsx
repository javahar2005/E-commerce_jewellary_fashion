import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatPrice, discountedPrice } from "@/lib/utils";
import { productCardSelect } from "@/lib/products";
import {
  getReviewSummary,
  getReviews,
  getReviewableOrders,
  REVIEW_PAGE_SIZE,
} from "@/lib/reviews";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AddToCartForm } from "@/components/store/AddToCartForm";
import { WishlistButton } from "@/components/store/WishlistButton";
import { ProductCard } from "@/components/store/ProductCard";
import { RecordProductView } from "@/components/store/RecordProductView";
import { RecentlyViewedRail } from "@/components/store/RecentlyViewedRail";
import { RatingInline } from "@/components/store/Rating";
import { ShippingEstimate } from "@/components/store/ShippingEstimate";
import { ProductReviews } from "@/components/store/ProductReviews";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description.slice(0, 150) };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
      category: true,
      seller: { select: { storeName: true, bio: true } },
    },
  });

  if (!product) notFound();

  const session = await getSession();
  const wishlisted =
    session?.role === "CUSTOMER"
      ? Boolean(
          await prisma.wishlistItem.findFirst({
            where: { productId: product.id, wishlist: { userId: session.userId } },
            select: { id: true },
          }),
        )
      : false;

  const [related, reviewSummary, reviewsPage, reviewableOrders] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, categoryId: product.categoryId, id: { not: product.id } },
      select: productCardSelect,
      take: 4,
    }),
    getReviewSummary(product.id),
    getReviews(product.id, REVIEW_PAGE_SIZE + 1),
    session?.role === "CUSTOMER"
      ? getReviewableOrders(session.userId, product.id)
      : Promise.resolve([] as { id: string; orderNumber: string; createdAt: Date }[]),
  ]);

  const reviewHasMore = reviewsPage.length > REVIEW_PAGE_SIZE;
  const initialReviews = reviewsPage.slice(0, REVIEW_PAGE_SIZE).map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  const hasDiscount = product.discount > 0;
  const final = discountedPrice(product.price, product.discount);
  const soldOut = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RecordProductView productId={product.id} />
      <nav className="mb-8 text-xs text-stone">
        <Link href="/products" className="hover:text-charcoal">
          Shop
        </Link>{" "}
        /{" "}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-charcoal">
          {product.category.name}
        </Link>{" "}
        / <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <p className="eyebrow mb-2">{product.seller.storeName}</p>
          <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">{product.name}</h1>

          <div className="mt-3">
            <RatingInline average={product.ratingAvg} count={product.ratingCount} />
          </div>

          <div className="mt-4 flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="text-xl text-charcoal">{formatPrice(final)}</span>
                <span className="text-stone line-through">{formatPrice(product.price)}</span>
                <span className="bg-charcoal px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-ivory">
                  Save {product.discount}%
                </span>
              </>
            ) : (
              <span className="text-xl text-charcoal">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="mt-2 text-xs text-stone">
            {soldOut ? "Out of stock" : `In stock — ${product.stock} available`}
          </p>

          <div className="my-7 h-px bg-charcoal/10" />

          <p className="text-sm leading-relaxed text-charcoal/80">{product.description}</p>

          <dl className="mt-6 space-y-2 text-sm">
            {product.material && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-stone">Material</dt>
                <dd className="text-charcoal">{product.material}</dd>
              </div>
            )}
            {product.sizes.length > 0 && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-stone">Sizes</dt>
                <dd className="text-charcoal">{product.sizes.join(", ")}</dd>
              </div>
            )}
            {product.colors.length > 0 && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-stone">Colors</dt>
                <dd className="text-charcoal">{product.colors.join(", ")}</dd>
              </div>
            )}
          </dl>

          <div className="my-7 h-px bg-charcoal/10" />

          <AddToCartForm
            productId={product.id}
            sizes={product.sizes}
            colors={product.colors}
            maxStock={product.stock}
          />

          <div className="mt-4">
            <WishlistButton productId={product.id} initial={wishlisted} />
          </div>

          <div className="mt-6">
            <ShippingEstimate inStock={!soldOut} />
          </div>

          <div className="mt-8 space-y-4 border-t border-charcoal/10 pt-6 text-sm">
            <div>
              <p className="font-medium text-charcoal">Sold by {product.seller.storeName}</p>
              {product.seller.bio && (
                <p className="mt-1 text-stone">{product.seller.bio}</p>
              )}
            </div>
            <div>
              <p className="font-medium text-charcoal">Shipping</p>
              <p className="mt-1 text-stone">
                Dispatched in 2–4 business days. Complimentary shipping on orders over $150,
                otherwise a flat $9.
              </p>
            </div>
            <div>
              <p className="font-medium text-charcoal">Returns</p>
              <p className="mt-1 text-stone">
                30-day returns on unworn pieces in original packaging. Made-to-order items excepted.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews
        productId={product.id}
        productSlug={product.slug}
        summary={reviewSummary}
        initialReviews={initialReviews}
        initialHasMore={reviewHasMore}
        initialNextSkip={REVIEW_PAGE_SIZE}
        reviewableOrders={reviewableOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt.toISOString(),
        }))}
        isLoggedIn={Boolean(session)}
        isCustomer={session?.role === "CUSTOMER"}
      />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-serif text-2xl text-charcoal">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewedRail excludeId={product.id} />
    </div>
  );
}
