import Link from "next/link";
import { formatPrice, cn } from "@/lib/utils";
import { hasRealDiscount } from "@/lib/pricing";
import { primaryImage, type ProductCardData } from "@/lib/productShared";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({
  product,
  wishlisted,
  showWishlist = true,
}: {
  product: ProductCardData;
  wishlisted?: boolean;
  showWishlist?: boolean;
}) {
  const img = primaryImage(product.images);
  const secondary = product.images.find((i) => i.url !== img)?.url ?? null;
  const hasDiscount = hasRealDiscount(product.price, product.discount);
  const final = product.effectivePrice;
  const soldOut = product.stock <= 0;

  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-beige">
          {img ? (
            <>
              <img
                src={img}
                alt={product.name}
                loading="lazy"
                className={cn(
                  "h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]",
                  soldOut && "opacity-70",
                )}
              />
              {secondary && (
                <img
                  src={secondary}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[700ms] ease-out group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-stone">
              No image
            </div>
          )}

          {hasDiscount && !soldOut && (
            <span className="absolute left-3 top-3 z-10 bg-charcoal px-2 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-ivory">
              −{product.discount}%
            </span>
          )}
          {soldOut && (
            <span className="absolute left-3 top-3 z-10 bg-white/90 px-2 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-charcoal">
              Sold out
            </span>
          )}

          {!soldOut && (
            <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-2 bg-gradient-to-t from-charcoal/55 to-transparent px-3 pb-3 pt-8 text-[0.7rem] uppercase tracking-[0.16em] text-ivory opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              View piece
            </span>
          )}
        </div>
      </Link>

      {showWishlist && (
        <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
          <WishlistButton productId={product.id} initial={wishlisted ?? false} compact />
        </div>
      )}

      <div className="mt-3 space-y-1 transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
        <p className="text-[0.7rem] uppercase tracking-[0.14em] text-stone">
          {product.seller.storeName}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="block font-serif text-[0.98rem] leading-snug text-charcoal transition-colors hover:text-stone"
        >
          {product.name}
        </Link>
        <p className="text-sm text-charcoal">
          {hasDiscount ? (
            <>
              <span className="mr-2 text-stone line-through">{formatPrice(product.price)}</span>
              <span>{formatPrice(final)}</span>
            </>
          ) : (
            formatPrice(product.price)
          )}
        </p>
      </div>
    </div>
  );
}
