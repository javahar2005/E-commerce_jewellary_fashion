import { prisma } from "@/lib/prisma";
import { primaryImage } from "@/lib/products";
import { AdminProductList } from "@/components/admin/AdminProductList";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
      category: { select: { name: true } },
      seller: { select: { storeName: true } },
    },
  });

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: primaryImage(p.images),
    price: p.price,
    stock: p.stock,
    published: p.published,
    category: p.category.name,
    store: p.seller.storeName,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Products</h1>
      <p className="mt-1 text-sm text-stone">{rows.length} across all stores</p>
      <div className="mt-8">
        <AdminProductList initial={rows} />
      </div>
    </div>
  );
}
