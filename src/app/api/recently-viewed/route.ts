import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { errorResponse, json } from "@/lib/api";
import {
  getRecentlyViewed,
  recordProductView,
  resolveRecentlyViewed,
} from "@/lib/recentlyViewed";

/**
 * GET  — authed customer: their list from the DB.
 *        guest: pass ?ids=a,b,c (from localStorage) to resolve to product cards.
 * POST — { productId } records a view for authed customers (guests use localStorage).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const url = new URL(req.url);
    const exclude = url.searchParams.get("exclude") ?? undefined;

    if (session && session.role === "CUSTOMER") {
      return json({ products: await getRecentlyViewed(session.userId, exclude) });
    }

    const ids = (url.searchParams.get("ids") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((id) => id !== exclude);
    return json({ products: await resolveRecentlyViewed(ids) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const productId = String(body?.productId ?? "");
    if (session && session.role === "CUSTOMER" && productId) {
      await recordProductView(session.userId, productId);
    }
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
