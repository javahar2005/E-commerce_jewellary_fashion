import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { registerSchema } from "@/lib/validations";
import { errorResponse, json, ApiError } from "@/lib/api";
import { homePathForRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new ApiError(409, "An account with this email already exists");

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data:
        data.role === "SELLER"
          ? {
              name: data.name,
              email: data.email.toLowerCase(),
              phone: data.phone,
              role: "SELLER",
              passwordHash,
              sellerProfile: { create: { storeName: data.storeName } },
            }
          : {
              name: data.name,
              email: data.email.toLowerCase(),
              phone: data.phone,
              role: "CUSTOMER",
              passwordHash,
              customerProfile: { create: {} },
              cart: { create: {} },
              wishlist: { create: {} },
            },
    });

    await createSession({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return json({ ok: true, redirect: homePathForRole(user.role) }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
