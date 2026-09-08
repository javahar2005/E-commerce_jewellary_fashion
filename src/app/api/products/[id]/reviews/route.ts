import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { authRole, errorResponse, json } from "@/lib/api";
import { reviewSchema } from "@/lib/validations";
import {
  createReview,
  getReviewableOrders,
  getReviews,
  getReviewSummary,
  REVIEW_PAGE_SIZE,
} from "@/lib/reviews";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const skip = Math.max(0, Number(new URL(req.url).searchParams.get("skip") ?? 0) || 0);

    const [summary, reviews] = await Promise.all([
      getReviewSummary(id),
      getReviews(id, REVIEW_PAGE_SIZE + 1, skip),
    ]);

    const hasMore = reviews.length > REVIEW_PAGE_SIZE;

    const session = await getSession();
    const eligibility =
      session?.role === "CUSTOMER"
        ? { orders: await getReviewableOrders(session.userId, id) }
        : { orders: [] };

    return json({
      summary,
      reviews: reviews.slice(0, REVIEW_PAGE_SIZE),
      hasMore,
      nextSkip: skip + REVIEW_PAGE_SIZE,
      eligibility,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authRole("CUSTOMER");
    const { id } = await params;
    const data = reviewSchema.parse(await req.json());

    await createReview({
      userId: user.id,
      productId: id,
      orderId: data.orderId,
      rating: data.rating,
      title: data.title || null,
      body: data.body,
    });

    return json({ ok: true }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
