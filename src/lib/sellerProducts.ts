import "server-only";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { validateDataUriImage } from "@/lib/images";
import { effectivePrice } from "@/lib/pricing";
import type { ProductInput } from "@/lib/validations";

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "product";
  let slug = base;
  let n = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${++n}`;
  }
}

function normaliseImages(images: ProductInput["images"]) {
  if (images.length < 1 || images.length > 3) {
    throw new ApiError(422, "Provide between 1 and 3 images");
  }
  for (const img of images) {
    const err = validateDataUriImage(img.url);
    if (err) throw new ApiError(422, err);
  }
  const primaryIdx = Math.max(
    0,
    images.findIndex((i) => i.isPrimary),
  );
  return images.map((img, idx) => ({
    url: img.url,
    isPrimary: idx === primaryIdx,
    position: idx,
  }));
}

export async function createSellerProduct(sellerId: string, data: ProductInput) {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new ApiError(422, "Choose a valid category");

  const images = normaliseImages(data.images);
  const slug = await uniqueSlug(data.name);

  return prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      discount: data.discount ?? 0,
      effectivePrice: effectivePrice(data.price, data.discount ?? 0),
      material: data.material || null,
      sizes: data.sizes,
      colors: data.colors,
      stock: data.stock,
      published: data.published,
      newArrival: true,
      categoryId: data.categoryId,
      sellerId,
      images: { create: images },
    },
    include: { images: true },
  });
}

export async function updateSellerProduct(
  sellerId: string,
  productId: string,
  data: ProductInput,
) {
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId } });
  if (!product) throw new ApiError(404, "Product not found");

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new ApiError(422, "Choose a valid category");

  const images = normaliseImages(data.images);
  const slug =
    product.name === data.name ? product.slug : await uniqueSlug(data.name, productId);

  return prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId } });
    return tx.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        discount: data.discount ?? 0,
        effectivePrice: effectivePrice(data.price, data.discount ?? 0),
        material: data.material || null,
        sizes: data.sizes,
        colors: data.colors,
        stock: data.stock,
        published: data.published,
        categoryId: data.categoryId,
        images: { create: images },
      },
      include: { images: true },
    });
  });
}
