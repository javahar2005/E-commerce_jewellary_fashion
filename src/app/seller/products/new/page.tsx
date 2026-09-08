import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/seller/ProductForm";

export default async function NewProductPage() {
  await requireRole("SELLER");
  const categories = await prisma.category.findMany({ orderBy: [{ group: "asc" }, { name: "asc" }] });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Add a product</h1>
      <p className="mt-1 text-sm text-stone">List a new piece for your store.</p>
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
