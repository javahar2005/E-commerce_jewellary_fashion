"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { formatPrice, cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/Modal";

type Row = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  stock: number;
  published: boolean;
  category: string;
  store: string;
};

export function AdminProductList({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const router = useRouter();

  const shown = rows.filter((r) =>
    filter === "all" ? true : filter === "published" ? r.published : !r.published,
  );

  async function togglePublish(row: Row) {
    setBusy(row.id);
    const res = await api<{ published: boolean }>(`/api/admin/products/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "publish", published: !row.published }),
    });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, published: res.data.published } : x)));
    router.refresh();
  }

  async function doDelete() {
    if (!deleteId) return;
    setBusy(deleteId);
    const res = await api(`/api/admin/products/${deleteId}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      toast.error(res.error);
      setDeleteId(null);
      return;
    }
    setRows((r) => r.filter((x) => x.id !== deleteId));
    toast.success("Product deleted");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex gap-2 text-xs">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "border px-3 py-1 capitalize",
              filter === f ? "border-charcoal bg-charcoal text-ivory" : "border-charcoal/25",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-charcoal/10">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-beige/60 text-left text-xs uppercase tracking-wide text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {shown.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden bg-beige">
                      {row.image && <img src={row.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <Link
                        href={`/products/${row.slug}`}
                        className="font-medium text-charcoal hover:underline"
                      >
                        {row.name}
                      </Link>
                      <p className="text-xs text-stone">{row.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone">{row.store}</td>
                <td className="px-4 py-3">{formatPrice(row.price)}</td>
                <td className="px-4 py-3">{row.stock}</td>
                <td className="px-4 py-3">
                  <button
                    disabled={busy === row.id}
                    onClick={() => togglePublish(row)}
                    className={cn(
                      "border px-2.5 py-1 text-xs",
                      row.published
                        ? "border-sage bg-sage/10 text-sage-deep"
                        : "border-charcoal/25 text-stone",
                    )}
                  >
                    {row.published ? "Published" : "Draft"} · toggle
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setDeleteId(row.id)}
                    className="text-xs text-stone underline hover:text-[#8f5748]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={doDelete}
        title="Delete this product?"
        message="Removes it from the marketplace. Past order records are kept."
        confirmLabel="Delete"
        loading={busy === deleteId}
      />
    </>
  );
}
