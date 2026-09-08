import "server-only";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Sends a transactional email via Resend when configured.
 * Returns { delivered: false } when there's no provider (or on failure) so the
 * caller can fall back to a dev-friendly flow (showing the link in the UI).
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ delivered: boolean }> {
  if (!isEmailConfigured()) {
    console.log(`[email:dev] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}`);
    return { delivered: false };
  }

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
        html: opts.html ?? `<pre style="font:14px/1.5 ui-sans-serif,system-ui">${opts.text}</pre>`,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 403) {
        // Resend rejects sends to addresses other than your own account email
        // until you verify a domain at resend.com/domains and use a `from`
        // address on it. The reset link is surfaced in the UI as a fallback.
        console.warn(
          `[email] Resend 403 — unverified sender / restricted recipient. ` +
            `Verify a domain and set EMAIL_FROM to it, or unset RESEND_API_KEY ` +
            `to use the in-app reset link. Response: ${body}`,
        );
      } else {
        console.error(`[email] Resend responded ${res.status}: ${body}`);
      }
      return { delivered: false };
    }
    return { delivered: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { delivered: false };
  }
}
