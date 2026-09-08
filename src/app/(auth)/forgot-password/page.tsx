"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await api<{ resetLink?: string; emailConfigured: boolean }>(
      "/api/auth/forgot-password",
      { method: "POST", body: JSON.stringify({ email }) },
    );
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
    setResetLink(res.data.resetLink ?? null);
  }

  return (
    <div>
      <p className="eyebrow mb-3">Account</p>
      <h1 className="font-serif text-3xl text-charcoal">Reset your password</h1>
      <p className="mt-2 text-sm text-stone">
        Enter your email and we'll send you a link to set a new password.
      </p>

      {error && (
        <div className="mt-6 border border-[#b4796a]/50 bg-[#b4796a]/10 px-4 py-3 text-sm text-[#8f5748]">
          {error}
        </div>
      )}

      {done ? (
        <div className="mt-6 space-y-4">
          <div className="border border-sage/50 bg-sage/10 px-4 py-3 text-sm text-sage-deep">
            If an account exists for {email}, a reset link is on its way.
          </div>
          {resetLink && (
            <div className="border border-champagne/50 bg-champagne/10 px-4 py-3 text-sm">
              <p className="font-medium text-[#8a713f]">Development mode — no email provider configured</p>
              <p className="mt-1 break-all text-charcoal">
                Use this link (valid 30 min):{" "}
                <Link href={resetLink.replace(/^https?:\/\/[^/]+/, "")} className="link-underline">
                  Open reset page
                </Link>
              </p>
            </div>
          )}
          <Link href="/login" className="link-underline text-sm text-charcoal">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
          <Link href="/login" className="block text-center text-xs text-stone hover:text-charcoal">
            Back to sign in
          </Link>
        </form>
      )}
    </div>
  );
}
