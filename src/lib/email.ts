import "server-only";
import nodemailer from "nodemailer";

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM,
  );
}

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function isEmailConfigured() {
  return smtpConfigured() || resendConfigured();
}

/**
 * Sends a transactional email. Prefers SMTP (e.g. a Gmail app password — sends
 * to any address, no domain needed), falls back to Resend, then to a no-op.
 * Returns { delivered: false } on any failure so callers can surface the link
 * in the UI instead.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ delivered: boolean }> {
  const html =
    opts.html ?? `<pre style="font:14px/1.5 ui-sans-serif,system-ui">${opts.text}</pre>`;

  if (smtpConfigured()) {
    try {
      const port = Number(process.env.SMTP_PORT);
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html,
      });
      return { delivered: true };
    } catch (err) {
      console.error("[email] SMTP send failed:", err);
      return { delivered: false };
    }
  }

  if (resendConfigured()) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: opts.to,
          subject: opts.subject,
          text: opts.text,
          html,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        if (res.status === 403) {
          console.warn(
            `[email] Resend 403 — the sender domain isn't verified, so sends are ` +
              `limited to your own account email. Verify a domain (resend.com/domains) ` +
              `and set EMAIL_FROM to it, or use SMTP. Response: ${body}`,
          );
        } else {
          console.error(`[email] Resend responded ${res.status}: ${body}`);
        }
        return { delivered: false };
      }
      return { delivered: true };
    } catch (err) {
      console.error("[email] Resend send failed:", err);
      return { delivered: false };
    }
  }

  console.log(`[email:dev] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}`);
  return { delivered: false };
}
