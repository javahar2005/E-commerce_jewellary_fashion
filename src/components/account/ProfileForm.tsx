"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function ProfileForm({
  initial,
  showStore = false,
}: {
  initial: { name: string; email: string; phone: string; storeName?: string; bio?: string };
  showStore?: boolean;
}) {
  const [form, setForm] = useState({
    name: initial.name,
    phone: initial.phone,
    storeName: initial.storeName ?? "",
    bio: initial.bio ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const res = await api("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(showStore ? form : { name: form.name, phone: form.phone }),
    });
    setLoading(false);
    if (!res.ok) {
      if ("issues" in (res as any)) setErrors((res as any).issues?.fieldErrors ?? {});
      toast.error(res.error);
      return;
    }
    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-lg space-y-4">
      <Field label="Name" error={errors.name?.[0]}>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </Field>
      <Field label="Email">
        <Input value={initial.email} disabled className="bg-beige/50" />
      </Field>
      <Field label="Phone" error={errors.phone?.[0]}>
        <Input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
      </Field>
      {showStore && (
        <>
          <Field label="Store name" error={errors.storeName?.[0]}>
            <Input
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              required
            />
          </Field>
          <Field label="Store bio" error={errors.bio?.[0]} hint="Shown on your product pages">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="min-h-[90px] w-full resize-y rounded-[3px] border border-charcoal/20 bg-white px-3.5 py-2.5 text-sm focus:border-charcoal focus:outline-none"
            />
          </Field>
        </>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
