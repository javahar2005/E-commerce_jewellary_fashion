import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validations";
import { errorResponse, json, ApiError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = resetPasswordSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (
      !user ||
      !user.resetTokenHash ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < new Date()
    ) {
      throw new ApiError(400, "This reset link is invalid or has expired");
    }

    const valid = await verifyPassword(token, user.resetTokenHash);
    if (!valid) throw new ApiError(400, "This reset link is invalid or has expired");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        resetTokenHash: null,
        resetTokenExpiry: null,
      },
    });

    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
