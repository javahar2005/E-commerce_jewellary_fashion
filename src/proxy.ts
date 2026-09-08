import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "velora_session";

async function readSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; role: "CUSTOMER" | "SELLER" | "ADMIN" };
  } catch {
    return null;
  }
}

const CUSTOMER_PREFIXES = ["/account", "/cart", "/wishlist", "/checkout", "/orders"];
const SELLER_PREFIX = "/seller";
const ADMIN_PREFIX = "/admin";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req);

  const needsAuth =
    pathname.startsWith(SELLER_PREFIX) ||
    pathname.startsWith(ADMIN_PREFIX) ||
    CUSTOMER_PREFIXES.some((p) => pathname.startsWith(p));

  if (!needsAuth) return NextResponse.next();

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(SELLER_PREFIX) && session.role !== "SELLER") {
    return NextResponse.redirect(new URL(session.role === "ADMIN" ? "/admin" : "/", req.url));
  }
  if (pathname.startsWith(ADMIN_PREFIX) && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL(session.role === "SELLER" ? "/seller" : "/", req.url));
  }
  if (
    CUSTOMER_PREFIXES.some((p) => pathname.startsWith(p)) &&
    session.role !== "CUSTOMER"
  ) {
    return NextResponse.redirect(new URL(session.role === "ADMIN" ? "/admin" : "/seller", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/cart/:path*",
    "/wishlist/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/seller/:path*",
    "/admin/:path*",
  ],
};
