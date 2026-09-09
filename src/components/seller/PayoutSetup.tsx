"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

type Initial = {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  enabled: boolean;
};

function mask(value: string) {
  const digits = value.replace(/\s+/g, "");
  if (digits.length < 4) return digits;
  return `•••• •••• ${digits.slice(-4)}`;
}

export function PayoutSetup({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [editing, setEditing] = useState(!initial.enabled);
  const [form, setForm] = useState({
    accountName: initial.accountName,
    accountNumber: initial.accountNumber,
    ifsc: initial.ifsc,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);
    const res = await api("/api/seller/payout", {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      if ("issues" in (res as any)) setErrors((res as any).issues?.fieldErrors ?? {});
      setError(res.error);
      return;
    }
    setEnabled(true);
    setEditing(false);
    toast.success("Payout details saved");
    router.refresh();
  }

  if (!editing && enabled) {
    return (
      <div className="border border-charcoal/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <Badge tone="sage">Payouts enabled</Badge>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-stone underline hover:text-charcoal"
          >
            Edit details
          </button>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-36 shrink-0 text-stone">Account holder</dt>
            <dd className="text-charcoal">{form.accountName}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-36 shrink-0 text-stone">Account number</dt>
            <dd className="text-charcoal">{mask(form.accountNumber)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-36 shrink-0 text-stone">IFSC code</dt>
            <dd className="text-charcoal">{form.ifsc}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-stone">
          Demo only — no real bank connection, and no payouts are processed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="border border-charcoal/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-serif text-base text-charcoal">
          {enabled ? "Update payout details" : "Link bank account"}
        </p>
        {enabled && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-stone underline hover:text-charcoal"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 border border-[#b4796a]/50 bg-[#b4796a]/10 px-3 py-2 text-xs text-[#8f5748]">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Field label="Account holder name" error={errors.accountName?.[0]}>
          <Input
            required
            value={form.accountName}
            onChange={set("accountName")}
            autoComplete="off"
          />
        </Field>
        <Field label="Bank account number" error={errors.accountNumber?.[0]}>
          <Input
            required
            inputMode="numeric"
            value={form.accountNumber}
            onChange={set("accountNumber")}
            autoComplete="off"
            placeholder="9–18 digits"
          />
        </Field>
        <Field label="IFSC code" error={errors.ifsc?.[0]}>
          <Input
            required
            value={form.ifsc}
            onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
            autoComplete="off"
            placeholder="e.g. HDFC0001234"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Set up payouts"}
        </Button>
      </div>
      <p className="mt-3 text-xs text-stone">
        Demo only — details are stored to show the flow. No real bank is contacted and no
        payouts are processed.
      </p>
    </form>
  );
}
