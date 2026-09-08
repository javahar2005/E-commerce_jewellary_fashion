import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/seller/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("SELLER");
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, sellerId: user.sellerProfile!.id },
    include: { images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] } },
  });
  if (!product) notFound();

  const categories = await prisma.category.findMany({ orderBy: [{ group: "asc" }, { name: "asc" }] });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Edit product</h1>
      <p className="mt-1 text-sm text-stone">{product.name}</p>
      <div className="mt-8">
        <ProductForm
          categories={categories}
          initial={{
            id: product.id,
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            price: (product.price / 100).toString(),
            discount: product.discount.toString(),
            material: product.material ?? "",
            sizes: product.sizes.join(", "),
            colors: product.colors.join(", "),
            stock: product.stock.toString(),
            published: product.published,
            images: product.images.map((i) => ({ url: i.url, isPrimary: i.isPrimary })),
          }}
        />
      </div>
    </div>
  );
}
