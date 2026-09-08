import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { customerProfile: true, sellerProfile: true },
  });
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Redirects to /login when unauthenticated. For use in server components. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirects unauthenticated to /login, wrong role to their home. */
export async function requireRole(role: Role): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== role) redirect(homePathForRole(user.role));
  return user;
}

export function homePathForRole(role: Role): string {
  switch (role) {
    case "SELLER":
      return "/seller";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}
