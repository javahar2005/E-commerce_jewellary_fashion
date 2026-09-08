"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const empty = {
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
  isDefault: false,
};

export function AddressManager({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openCreate() {
    setForm(empty);
    setErrors({});
    setCreating(true);
  }
  function openEdit(a: Address) {
    setForm({ ...a });
    setErrors({});
    setEditing(a);
  }
  function close() {
    setCreating(false);
    setEditing(null);
  }

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const res = editing
      ? await api<Address>(`/api/addresses/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        })
      : await api<Address>("/api/addresses", { method: "POST", body: JSON.stringify(form) });
    setLoading(false);
    if (!res.ok) {
      if ("issues" in (res as any)) setErrors((res as any).issues?.fieldErrors ?? {});
      toast.error(res.error);
      return;
    }
    const saved = res.data;
    setAddresses((list) => {
      const others = editing
        ? list.filter((a) => a.id !== editing.id)
        : list;
      const next = [...others, saved];
      return saved.isDefault
        ? next.map((a) => (a.id === saved.id ? a : { ...a, isDefault: false }))
        : next;
    });
    toast.success(editing ? "Address updated" : "Address added");
    close();
    router.refresh();
  }

  async function doDelete() {
    if (!deleteId) return;
    setLoading(true);
    const res = await api(`/api/addresses/${deleteId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      setDeleteId(null);
      return;
    }
    setAddresses((l) => l.filter((a) => a.id !== deleteId));
    toast.success("Address removed");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-xl text-charcoal">Saved addresses</h2>
        <Button size="sm" variant="outline" onClick={openCreate}>
          Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState title="No addresses yet" description="Add one to speed up checkout." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="border border-charcoal/10 bg-white p-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium text-charcoal">{a.fullName}</p>
                {a.isDefault && (
                  <span className="text-[0.6rem] uppercase tracking-[0.14em] text-sage-deep">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-1 text-stone">{a.phone}</p>
              <p className="mt-2 text-charcoal/80">
                {a.line1}
                <br />
                {a.city}, {a.state} {a.postalCode}
                <br />
                {a.country}
              </p>
              <div className="mt-3 flex gap-3 text-xs">
                <button onClick={() => openEdit(a)} className="underline hover:text-charcoal">
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(a.id)}
                  className="text-stone underline hover:text-[#8f5748]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        onClose={close}
        title={editing ? "Edit address" : "Add address"}
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Full name" error={errors.fullName?.[0]}>
            <Input required value={form.fullName} onChange={set("fullName")} />
          </Field>
          <Field label="Phone" error={errors.phone?.[0]}>
            <Input required value={form.phone} onChange={set("phone")} />
          </Field>
          <Field label="Address line" error={errors.line1?.[0]}>
            <Input required value={form.line1} onChange={set("line1")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" error={errors.city?.[0]}>
              <Input required value={form.city} onChange={set("city")} />
            </Field>
            <Field label="State" error={errors.state?.[0]}>
              <Input required value={form.state} onChange={set("state")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Postal code" error={errors.postalCode?.[0]}>
              <Input required value={form.postalCode} onChange={set("postalCode")} />
            </Field>
            <Field label="Country" error={errors.country?.[0]}>
              <Input required value={form.country} onChange={set("country")} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 accent-charcoal"
            />
            Set as default address
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="border border-charcoal/25 px-4 py-2 text-xs hover:bg-beige"
            >
              Cancel
            </button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving…" : "Save address"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={doDelete}
        title="Delete this address?"
        message="This cannot be undone."
        confirmLabel="Delete address"
        loading={loading}
      />
    </div>
  );
}
