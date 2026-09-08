"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_TYPES } from "@/lib/images";

type Category = { id: string; name: string; group: string };
type ImageItem = { url: string; isPrimary: boolean };

export type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  price: string;
  discount: string;
  material: string;
  sizes: string;
  colors: string;
  stock: string;
  published: boolean;
  images: ImageItem[];
};

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? {
      name: "",
      description: "",
      categoryId: categories[0]?.id ?? "",
      price: "",
      discount: "0",
      material: "",
      sizes: "",
      colors: "",
      stock: "0",
      published: false,
      images: [],
    },
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  async function onPickFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = 3 - values.images.length;
    if (room <= 0) {
      toast.error("You can upload up to 3 images");
      return;
    }
    const picked = Array.from(files).slice(0, room);
    const next: ImageItem[] = [];
    for (const file of picked) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: must be JPEG, PNG or WebP`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name}: must be 2MB or smaller`);
        continue;
      }
      next.push({ url: await readFile(file), isPrimary: false });
    }
    setValues((s) => {
      const images = [...s.images, ...next].slice(0, 3);
      if (!images.some((i) => i.isPrimary) && images.length) images[0].isPrimary = true;
      return { ...s, images };
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(idx: number) {
    setValues((s) => {
      const images = s.images.filter((_, i) => i !== idx);
      if (images.length && !images.some((i) => i.isPrimary)) images[0].isPrimary = true;
      return { ...s, images };
    });
  }

  function makePrimary(idx: number) {
    setValues((s) => ({
      ...s,
      images: s.images.map((img, i) => ({ ...img, isPrimary: i === idx })),
    }));
  }

  async function submit(e: React.FormEvent, publishOverride?: boolean) {
    e.preventDefault();
    setErrors({});
    if (values.images.length < 1) {
      toast.error("Add at least one image");
      return;
    }
    setLoading(true);
    const payload = {
      name: values.name,
      description: values.description,
      categoryId: values.categoryId,
      price: Math.round(Number(values.price) * 100),
      discount: Number(values.discount) || 0,
      material: values.material,
      sizes: values.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: values.colors.split(",").map((s) => s.trim()).filter(Boolean),
      stock: Number(values.stock) || 0,
      published: publishOverride ?? values.published,
      images: values.images,
    };

    const res = values.id
      ? await api<{ id: string }>(`/api/seller/products/${values.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await api<{ id: string }>("/api/seller/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    setLoading(false);
    if (!res.ok) {
      if ("issues" in (res as any)) setErrors((res as any).issues?.fieldErrors ?? {});
      toast.error(res.error);
      return;
    }
    toast.success(values.id ? "Product updated" : "Product created");
    router.push("/seller/products");
    router.refresh();
  }

  return (
    <form onSubmit={(e) => submit(e)} className="max-w-2xl space-y-6">
      <Field label="Product name" error={errors.name?.[0]}>
        <Input value={values.name} onChange={(e) => set("name", e.target.value)} required />
      </Field>

      <Field label="Description" error={errors.description?.[0]}>
        <Textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" error={errors.categoryId?.[0]}>
          <Select
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.group} — {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Material" error={errors.material?.[0]}>
          <Input value={values.material} onChange={(e) => set("material", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price (USD)" error={errors.price?.[0]}>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
            required
          />
        </Field>
        <Field label="Discount (%)" error={errors.discount?.[0]}>
          <Input
            type="number"
            min="0"
            max="90"
            value={values.discount}
            onChange={(e) => set("discount", e.target.value)}
          />
        </Field>
        <Field label="Stock" error={errors.stock?.[0]}>
          <Input
            type="number"
            min="0"
            value={values.stock}
            onChange={(e) => set("stock", e.target.value)}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sizes" hint="Comma separated, e.g. S, M, L">
          <Input value={values.sizes} onChange={(e) => set("sizes", e.target.value)} />
        </Field>
        <Field label="Colors" hint="Comma separated, e.g. Gold, Silver">
          <Input value={values.colors} onChange={(e) => set("colors", e.target.value)} />
        </Field>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium tracking-wide text-charcoal">
          Images <span className="text-stone">(1–3, JPEG/PNG/WebP, max 2MB each)</span>
        </p>
        <p className="mb-2.5 text-xs text-stone">
          The primary image is shown first on the product page and used on cards, wishlist and bag.
        </p>
        <div className="flex flex-wrap gap-4">
          {values.images.map((img, i) => (
            <div key={i} className="w-32">
              <div
                className={cn(
                  "relative aspect-[4/5] overflow-hidden border",
                  img.isPrimary ? "border-charcoal ring-1 ring-charcoal" : "border-charcoal/20",
                )}
              >
                <img src={img.url} alt={`Product image ${i + 1}`} className="h-full w-full object-cover" />
                {img.isPrimary && (
                  <span className="absolute left-0 top-0 bg-charcoal px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-ivory">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-charcoal hover:bg-white"
                >
                  ✕
                </button>
              </div>
              <button
                type="button"
                onClick={() => makePrimary(i)}
                disabled={img.isPrimary}
                className={cn(
                  "mt-1.5 w-full border px-2 py-1 text-[0.7rem] tracking-wide transition-colors",
                  img.isPrimary
                    ? "border-charcoal/15 text-stone"
                    : "border-charcoal/30 text-charcoal hover:border-charcoal",
                )}
              >
                {img.isPrimary ? "Primary image" : "Set as primary"}
              </button>
            </div>
          ))}
          {values.images.length < 3 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[4/5] w-32 flex-col items-center justify-center gap-1 border border-dashed border-charcoal/30 text-xs text-stone hover:border-charcoal"
            >
              <span className="text-lg">+</span>
              Add image
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => onPickFiles(e.target.files)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => set("published", e.target.checked)}
          className="h-4 w-4 accent-charcoal"
        />
        Published (visible in the storefront)
      </label>

      <div className="flex flex-wrap gap-3 border-t border-charcoal/10 pt-5">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : values.id ? "Save changes" : "Create product"}
        </Button>
        {!values.id && (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={(e) => submit(e as any, true)}
          >
            Create &amp; publish
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/seller/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
