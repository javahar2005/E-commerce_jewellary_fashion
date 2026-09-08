"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { Field } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token || !email) {
    return (
      <div>
        <h1 className="font-serif text-3xl">Invalid reset link</h1>
        <p className="mt-2 text-sm text-stone">
          This link is missing information. Request a new one.
        </p>
        <Link href="/forgot-password" className="link-underline mt-4 inline-block text-sm text-charcoal">
          Request a new link
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await api("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, email, ...form }),
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div>
      <p className="eyebrow mb-3">Account</p>
      <h1 className="font-serif text-3xl text-charcoal">Set a new password</h1>

      {error && (
        <div className="mt-6 border border-[#b4796a]/50 bg-[#b4796a]/10 px-4 py-3 text-sm text-[#8f5748]">
          {error}
        </div>
      )}
      {done ? (
        <div className="mt-6 border border-sage/50 bg-sage/10 px-4 py-3 text-sm text-sage-deep">
          Password updated. Redirecting to sign in…
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="New password" hint="At least 8 characters">
            <PasswordInput
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}
