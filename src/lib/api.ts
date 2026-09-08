import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.flatten() },
      { status: 422 },
    );
  }
  console.error("[api] unhandled error:", error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}

/** Returns the authenticated DB user or throws 401. */
export async function authUser() {
  const session = await getSession();
  if (!session) throw new ApiError(401, "You must be signed in");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { sellerProfile: true, customerProfile: true },
  });
  if (!user) throw new ApiError(401, "Session is no longer valid");
  return user;
}

export async function authRole(role: Role) {
  const user = await authUser();
  if (user.role !== role) throw new ApiError(403, "You do not have access to this resource");
  return user;
}

export async function authSeller() {
  const user = await authRole("SELLER");
  if (!user.sellerProfile) throw new ApiError(403, "Seller profile missing");
  return { user, seller: user.sellerProfile };
}
