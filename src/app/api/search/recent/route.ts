import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { errorResponse, json } from "@/lib/api";
import { getRecentSearches, recordSearch, normaliseQuery } from "@/lib/search";

/** Returns [] for guests (the client uses localStorage for them). */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "CUSTOMER") return json({ searches: [] });
    return json({ searches: await getRecentSearches(session.userId) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const query = normaliseQuery(String(body?.query ?? ""));
    if (!session || session.role !== "CUSTOMER" || query.length < 2) {
      return json({ ok: true, searches: [] });
    }
    await recordSearch(session.userId, query);
    return json({ ok: true, searches: await getRecentSearches(session.userId) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CUSTOMER") return json({ ok: true });
    const query = normaliseQuery(new URL(req.url).searchParams.get("q") ?? "");
    if (query) {
      await prisma.recentSearch.deleteMany({ where: { userId: session.userId, query } });
    } else {
      await prisma.recentSearch.deleteMany({ where: { userId: session.userId } });
    }
    return json({ ok: true, searches: await getRecentSearches(session.userId) });
  } catch (e) {
    return errorResponse(e);
  }
}
