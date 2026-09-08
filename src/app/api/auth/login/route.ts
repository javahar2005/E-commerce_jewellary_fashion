import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validations";
import { errorResponse, json, ApiError } from "@/lib/api";
import { homePathForRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ApiError(401, "Incorrect email or password");
    }

    // Ensure customer has cart + wishlist rows.
    if (user.role === "CUSTOMER") {
      await prisma.cart.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
      await prisma.wishlist.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
    }

    await createSession({ userId: user.id, role: user.role, email: user.email, name: user.name });

    return json({ ok: true, redirect: homePathForRole(user.role) });
  } catch (e) {
    return errorResponse(e);
  }
}
