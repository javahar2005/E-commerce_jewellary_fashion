"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { formatPrice, cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";

type Row = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  discount: number;
  stock: number;
  published: boolean;
  category: string;
};

export function SellerProductList({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stockEdit, setStockEdit] = useState<Record<string, string>>({});
  const router = useRouter();

  async function togglePublish(row: Row) {
    setBusy(row.id);
    const res = await api<{ published: boolean }>(`/api/seller/products/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "publish", published: !row.published }),
    });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, published: res.data.published } : x)));
    toast.success(res.data.published ? "Published" : "Unpublished");
    router.refresh();
  }

  async function saveStock(row: Row) {
    const raw = stockEdit[row.id];
    if (raw === undefined) return;
    const stock = Number(raw);
    if (!Number.isInteger(stock) || stock < 0) return toast.error("Enter a valid stock number");
    setBusy(row.id);
    const res = await api<{ stock: number }>(`/api/seller/products/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "stock", stock }),
    });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, stock: res.data.stock } : x)));
    setStockEdit((s) => {
      const next = { ...s };
      delete next[row.id];
      return next;
    });
    toast.success("Stock updated");
    router.refresh();
  }

  async function doDelete() {
    if (!deleteId) return;
    setBusy(deleteId);
    const res = await api(`/api/seller/products/${deleteId}`, { method: "DELETE" });
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

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Add your first piece to start selling."
        actionHref="/seller/products/new"
        actionLabel="Add a product"
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto border border-charcoal/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-beige/60 text-left text-xs uppercase tracking-wide text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {rows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden bg-beige">
                      {row.image && (
                        <img src={row.image} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{row.name}</p>
                      <p className="text-xs text-stone">{row.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {row.discount > 0 ? (
                    <>
                      <span className="text-stone line-through">{formatPrice(row.price)}</span>{" "}
                      <span>−{row.discount}%</span>
                    </>
                  ) : (
                    formatPrice(row.price)
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      value={stockEdit[row.id] ?? String(row.stock)}
                      onChange={(e) =>
                        setStockEdit((s) => ({ ...s, [row.id]: e.target.value }))
                      }
                      className="h-8 w-16 border border-charcoal/20 bg-white px-2 text-sm"
                    />
                    {stockEdit[row.id] !== undefined &&
                      stockEdit[row.id] !== String(row.stock) && (
                        <button
                          disabled={busy === row.id}
                          onClick={() => saveStock(row)}
                          className="h-8 border border-charcoal px-2 text-xs"
                        >
                          Save
                        </button>
                      )}
                  </div>
                </td>
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
                  <div className="flex gap-3 text-xs">
                    <Link
                      href={`/seller/products/${row.id}/edit`}
                      className="underline hover:text-charcoal"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(row.id)}
                      className="text-stone underline hover:text-[#8f5748]"
                    >
                      Delete
                    </button>
                  </div>
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
        message="It will be removed from your store. Past orders keep their records."
        confirmLabel="Delete product"
        loading={busy === deleteId}
      />
    </>
  );
}
