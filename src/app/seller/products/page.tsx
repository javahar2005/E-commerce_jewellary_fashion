import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { primaryImage } from "@/lib/products";
import { SellerProductList } from "@/components/seller/SellerProductList";

export const dynamic = "force-dynamic";

export default async function SellerProductsPage() {
  const user = await requireRole("SELLER");
  const products = await prisma.product.findMany({
    where: { sellerId: user.sellerProfile!.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
    },
  });

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    image: primaryImage(p.images),
    price: p.price,
    discount: p.discount,
    stock: p.stock,
    published: p.published,
    category: p.category.name,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-stone">{rows.length} in your store</p>
        </div>
        <Link href="/seller/products/new" className="bg-charcoal px-4 py-2 text-sm text-ivory">
          Add product
        </Link>
      </div>
      <div className="mt-8">
        <SellerProductList initial={rows} />
      </div>
    </div>
  );
}
