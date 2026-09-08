import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authUser, errorResponse, json } from "@/lib/api";
import { profileSchema } from "@/lib/validations";
import { createSession } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  try {
    const user = await authUser();
    const data = profileSchema.parse(await req.json());

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: data.name, phone: data.phone },
    });

    if (user.role === "SELLER" && user.sellerProfile) {
      await prisma.sellerProfile.update({
        where: { id: user.sellerProfile.id },
        data: {
          storeName: data.storeName ?? user.sellerProfile.storeName,
          bio: data.bio ?? user.sellerProfile.bio,
        },
      });
    }

    // Refresh session (name may have changed).
    await createSession({
      userId: updated.id,
      role: updated.role,
      email: updated.email,
      name: updated.name,
    });

    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
