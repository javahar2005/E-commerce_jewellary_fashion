"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { formatDate, cn } from "@/lib/utils";
import { Stars } from "./Rating";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/States";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  user: { name: string };
};
type Summary = {
  average: number;
  count: number;
  distribution: Record<string, number>;
};
type ReviewableOrder = { id: string; orderNumber: string; createdAt: string };

export function ProductReviews({
  productId,
  productSlug,
  summary,
  initialReviews,
  initialHasMore,
  initialNextSkip,
  reviewableOrders,
  isLoggedIn,
  isCustomer,
}: {
  productId: string;
  productSlug: string;
  summary: Summary;
  initialReviews: Review[];
  initialHasMore: boolean;
  initialNextSkip: number;
  reviewableOrders: ReviewableOrder[];
  isLoggedIn: boolean;
  isCustomer: boolean;
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [skip, setSkip] = useState(initialNextSkip);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    setLoadingMore(true);
    const res = await api<{ reviews: Review[]; hasMore: boolean; nextSkip: number }>(
      `/api/products/${productId}/reviews?skip=${skip}`,
    );
    setLoadingMore(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setReviews((r) => [...r, ...res.data.reviews]);
    setHasMore(res.data.hasMore);
    setSkip(res.data.nextSkip);
  }

  return (
    <section id="reviews" className="mt-20 scroll-mt-24 border-t border-charcoal/10 pt-14">
      <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">Reviews</h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">
        {/* Summary */}
        <div>
          {summary.count === 0 ? (
            <div>
              <Stars value={0} size="1.4rem" />
              <p className="mt-2 text-sm text-stone">No reviews yet</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3">
                <span className="font-serif text-4xl text-charcoal">
                  {summary.average.toFixed(1)}
                </span>
                <div className="pb-1.5">
                  <Stars value={summary.average} size="1rem" />
                  <p className="mt-1 text-xs text-stone">
                    {summary.count} {summary.count === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const n = summary.distribution[String(star)] ?? 0;
                  const pct = summary.count ? (n / summary.count) * 100 : 0;
                  return (
                    <li key={star} className="flex items-center gap-2 text-xs text-stone">
                      <span className="w-3 text-right">{star}</span>
                      <span className="relative h-1.5 flex-1 bg-charcoal/10">
                        <span
                          className="absolute inset-y-0 left-0 bg-champagne"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-6 text-right tabular-nums">{n}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="mt-8">
            <ReviewComposer
              productId={productId}
              productSlug={productSlug}
              reviewableOrders={reviewableOrders}
              isLoggedIn={isLoggedIn}
              isCustomer={isCustomer}
              onSubmitted={() => {
                router.refresh();
              }}
            />
          </div>
        </div>

        {/* List */}
        <div>
          {reviews.length === 0 ? (
            <div className="border border-dashed border-charcoal/15 bg-white/50 px-6 py-12 text-center">
              <p className="font-serif text-lg text-charcoal">No reviews yet</p>
              <p className="mt-1 text-sm text-stone">
                Be the first to share your thoughts on this piece.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-charcoal/10">
              {reviews.map((r) => (
                <li key={r.id} className="py-6 first:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <Stars value={r.rating} size="0.85rem" />
                    <span className="text-xs text-stone">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.title && (
                    <p className="mt-2 font-serif text-base text-charcoal">{r.title}</p>
                  )}
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-charcoal/80">
                    {r.body}
                  </p>
                  <p className="mt-2.5 flex items-center gap-2 text-xs text-stone">
                    <span>{r.user.name}</span>
                    <span aria-hidden>·</span>
                    <span className="text-sage-deep">Verified purchase</span>
                  </p>
                </li>
              ))}
            </ul>
          )}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-6 inline-flex items-center gap-2 border border-charcoal/25 px-5 py-2.5 text-xs tracking-wide hover:bg-beige disabled:opacity-50"
            >
              {loadingMore ? <Spinner /> : null}
              {loadingMore ? "Loading" : "Load more reviews"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewComposer({
  productId,
  productSlug,
  reviewableOrders,
  isLoggedIn,
  isCustomer,
  onSubmitted,
}: {
  productId: string;
  productSlug: string;
  reviewableOrders: ReviewableOrder[];
  isLoggedIn: boolean;
  isCustomer: boolean;
  onSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [orderId, setOrderId] = useState(reviewableOrders[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="border border-charcoal/10 bg-white/60 p-4 text-sm text-stone">
        <Link
          href={`/login?next=/products/${productSlug}`}
          className="link-underline text-charcoal"
        >
          Sign in
        </Link>{" "}
        to review a piece you've purchased.
      </div>
    );
  }

  if (!isCustomer) return null;

  if (reviewableOrders.length === 0) {
    return (
      <p className="border border-charcoal/10 bg-white/60 p-4 text-sm text-stone">
        Only customers who've purchased this piece can review it.
      </p>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Write a review
      </Button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrors({});
    if (rating < 1) {
      setError("Please choose a star rating");
      return;
    }
    setLoading(true);
    const res = await api(`/api/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ orderId, rating, title, body }),
    });
    setLoading(false);
    if (!res.ok) {
      if ("issues" in (res as any)) setErrors((res as any).issues?.fieldErrors ?? {});
      setError(res.error);
      return;
    }
    toast.success("Thank you — your review is published");
    setOpen(false);
    setRating(0);
    setTitle("");
    setBody("");
    onSubmitted();
  }

  return (
    <form onSubmit={submit} className="space-y-4 border border-charcoal/15 bg-white p-4">
      <p className="font-serif text-base text-charcoal">Write a review</p>

      {error && (
        <div className="border border-[#b4796a]/50 bg-[#b4796a]/10 px-3 py-2 text-xs text-[#8f5748]">
          {error}
        </div>
      )}

      <div>
        <p className="mb-1.5 text-xs font-medium text-charcoal">Your rating</p>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className={cn(
                "text-2xl leading-none transition-colors",
                (hover || rating) >= n ? "text-champagne" : "text-charcoal/20",
              )}
            >
              ★
            </button>
          ))}
        </div>
        {errors.rating?.[0] && <p className="mt-1 text-xs text-[#8f5748]">{errors.rating[0]}</p>}
      </div>

      {reviewableOrders.length > 1 && (
        <Field label="Order" error={errors.orderId?.[0]}>
          <select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="h-10 w-full rounded-[3px] border border-charcoal/20 bg-white px-3 text-sm focus:border-charcoal focus:outline-none"
          >
            {reviewableOrders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} · {formatDate(o.createdAt)}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Title (optional)" error={errors.title?.[0]}>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </Field>

      <Field label="Your review" error={errors.body?.[0]}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          className="min-h-[110px] w-full resize-y rounded-[3px] border border-charcoal/20 bg-white px-3.5 py-2.5 text-sm focus:border-charcoal focus:outline-none"
        />
      </Field>

      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Publishing…" : "Publish review"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-stone underline hover:text-charcoal"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
