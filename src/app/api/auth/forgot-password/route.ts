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
      text:
        `Hi ${user.name},\n\n` +
        `We received a request to reset your Velora password. ` +
        `Use the link below within 30 minutes:\n\n${link}\n\n` +
        `If you didn't ask for this, you can ignore this email.`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,Arial,sans-serif;background:#f7f4ef;padding:40px 0">
          <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid rgba(41,40,36,.1);padding:36px">
            <p style="font-family:Georgia,serif;font-size:22px;letter-spacing:.15em;color:#292824;margin:0 0 24px">VELORA</p>
            <p style="font-size:15px;color:#292824;margin:0 0 8px">Hi ${user.name},</p>
            <p style="font-size:14px;line-height:1.6;color:#57534b;margin:0 0 24px">
              We received a request to reset your password. This link is valid for 30 minutes.
            </p>
            <a href="${link}" style="display:inline-block;background:#292824;color:#f7f4ef;text-decoration:none;padding:12px 24px;font-size:14px">
              Reset password
            </a>
            <p style="font-size:12px;line-height:1.6;color:#77736b;margin:24px 0 0">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>`,
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
