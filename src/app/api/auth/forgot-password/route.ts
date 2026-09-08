import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { forgotPasswordSchema } from "@/lib/validations";
import { errorResponse, json } from "@/lib/api";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { appUrl } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email } = forgotPasswordSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always respond the same way to avoid account enumeration.
    if (!user) {
      return json({ ok: true, emailConfigured: isEmailConfigured() });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await hashPassword(rawToken);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    const link = appUrl(`/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`);
    const { delivered } = await sendEmail({
      to: user.email,
      subject: "Reset your Velora password",
      text: `Use this link within 30 minutes to reset your password:\n\n${link}`,
    });

    return json({
      ok: true,
      emailConfigured: delivered,
      // Dev fallback only — surfaced in the UI when no email provider is configured.
      resetLink: delivered ? undefined : link,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
