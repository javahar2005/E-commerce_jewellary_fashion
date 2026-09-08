import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authSeller, errorResponse, json, ApiError } from "@/lib/api";
import { productSchema, updateStockSchema } from "@/lib/validations";
import { updateSellerProduct } from "@/lib/sellerProducts";

async function ownProduct(sellerId: string, id: string) {
  const product = await prisma.product.findFirst({ where: { id, sellerId } });
  if (!product) throw new ApiError(404, "Product not found");
  return product;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { seller } = await authSeller();
    const { id } = await params;
    const body = await req.json();

    if (body?.action === "publish") {
      await ownProduct(seller.id, id);
      const updated = await prisma.product.update({
        where: { id },
        data: { published: Boolean(body.published) },
      });
      return json({ ok: true, published: updated.published });
    }

    if (body?.action === "stock") {
      await ownProduct(seller.id, id);
      const { stock } = updateStockSchema.parse(body);
      const updated = await prisma.product.update({ where: { id }, data: { stock } });
      return json({ ok: true, stock: updated.stock });
    }

    const data = productSchema.parse(body);
    const product = await updateSellerProduct(seller.id, id, data);
    return json({ ok: true, id: product.id });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { seller } = await authSeller();
    const { id } = await params;
    await ownProduct(seller.id, id);

    // Detach from historical order items, then delete.
    await prisma.orderItem.updateMany({ where: { productId: id }, data: { productId: null } });
    await prisma.product.delete({ where: { id } });

    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
