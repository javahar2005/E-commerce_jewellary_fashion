"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { Field, Input } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Role = "CUSTOMER" | "SELLER";

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") === "SELLER" ? "SELLER" : null;
  const [role, setRole] = useState<Role | null>(initialRole);

  if (!role) {
    return (
      <div>
        <p className="eyebrow mb-3">Join Velora</p>
        <h1 className="font-serif text-3xl text-charcoal">How would you like to use Velora?</h1>
        <p className="mt-2 text-sm text-stone">You can only choose one — this sets up your account.</p>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => setRole("CUSTOMER")}
            className="block w-full border border-charcoal/20 bg-white p-6 text-left transition-colors hover:border-charcoal"
          >
            <p className="font-serif text-xl text-charcoal">Shop as Customer</p>
            <p className="mt-1 text-sm text-stone">
              Browse and buy from independent makers, save pieces and track orders.
            </p>
          </button>
          <button
            onClick={() => setRole("SELLER")}
            className="block w-full border border-charcoal/20 bg-white p-6 text-left transition-colors hover:border-charcoal"
          >
            <p className="font-serif text-xl text-charcoal">Sell on Velora</p>
            <p className="mt-1 text-sm text-stone">
              Open a store, list products and manage your own orders.
            </p>
          </button>
        </div>
        <p className="mt-6 text-sm text-stone">
          Already have an account?{" "}
          <Link href="/login" className="link-underline text-charcoal">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return <RegisterForm role={role} onBack={() => setRole(null)} onDone={(r) => { router.push(r); router.refresh(); }} />;
}

function RegisterForm({
  role,
  onBack,
  onDone,
}: {
  role: Role;
  onBack: () => void;
  onDone: (redirect: string) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    storeName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);
    const payload =
      role === "SELLER"
        ? { role, ...form }
        : { role, name: form.name, email: form.email, phone: form.phone, password: form.password, confirmPassword: form.confirmPassword };

    const res = await api<{ redirect: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      if ("issues" in (res as any)) setErrors((res as any).issues?.fieldErrors ?? {});
      setError(res.error);
      return;
    }
    onDone(res.data.redirect);
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-xs text-stone hover:text-charcoal">
        ← Change account type
      </button>
      <p className="eyebrow mb-3">{role === "SELLER" ? "Open your store" : "Create your account"}</p>
      <h1 className="font-serif text-3xl text-charcoal">
        {role === "SELLER" ? "Sell on Velora" : "Shop as Customer"}
      </h1>

      {error && (
        <div className="mt-6 border border-[#b4796a]/50 bg-[#b4796a]/10 px-4 py-3 text-sm text-[#8f5748]">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Name" error={errors.name?.[0]}>
          <Input required value={form.name} onChange={set("name")} autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email?.[0]}>
          <Input type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
        </Field>
        <Field label="Phone" error={errors.phone?.[0]}>
          <Input required value={form.phone} onChange={set("phone")} autoComplete="tel" />
        </Field>
        {role === "SELLER" && (
          <Field label="Store name" error={errors.storeName?.[0]}>
            <Input required value={form.storeName} onChange={set("storeName")} />
          </Field>
        )}
        <Field label="Password" error={errors.password?.[0]} hint="At least 8 characters">
          <PasswordInput
            required
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword?.[0]}>
          <PasswordInput
            required
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" className={cn("w-full")} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
