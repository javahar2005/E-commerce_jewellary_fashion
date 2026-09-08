import { NextRequest } from "next/server";
import { errorResponse, json } from "@/lib/api";
import { getSuggestions } from "@/lib/search";

export async function GET(req: NextRequest) {
  try {
    const q = new URL(req.url).searchParams.get("q") ?? "";
    if (q.trim().length < 3) return json({ suggestions: [] });
    return json({ suggestions: await getSuggestions(q) });
  } catch (e) {
    return errorResponse(e);
  }
}
