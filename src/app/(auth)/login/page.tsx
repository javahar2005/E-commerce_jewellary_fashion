"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { Field, Input } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await api<{ redirect: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(next || res.data.redirect);
    router.refresh();
  }

  return (
    <div>
      <p className="eyebrow mb-3">Welcome back</p>
      <h1 className="font-serif text-3xl text-charcoal">Sign in to Velora</h1>
      <p className="mt-2 text-sm text-stone">
        New here?{" "}
        <Link href="/register" className="link-underline text-charcoal">
          Create an account
        </Link>
      </p>

      {error && (
        <div className="mt-6 border border-[#b4796a]/50 bg-[#b4796a]/10 px-4 py-3 text-sm text-[#8f5748]">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password">
          <PasswordInput
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-stone hover:text-charcoal">
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-8 border-t border-charcoal/10 pt-5 text-xs text-stone">
        <p className="font-medium text-charcoal">Demo accounts</p>
        <p className="mt-1">customer@velora.test · seller1@velora.test · admin@velora.test</p>
        <p>Passwords: Customer123! / Seller123! / Admin123!</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
