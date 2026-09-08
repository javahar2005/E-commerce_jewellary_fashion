import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRole, errorResponse, json, ApiError } from "@/lib/api";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await authRole("ADMIN");
    const { id } = await params;
    const body = await req.json();
    if (body?.action !== "publish") throw new ApiError(400, "Unsupported action");

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new ApiError(404, "Product not found");

    const updated = await prisma.product.update({
      where: { id },
      data: { published: Boolean(body.published) },
    });
    return json({ ok: true, published: updated.published });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await authRole("ADMIN");
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new ApiError(404, "Product not found");

    await prisma.orderItem.updateMany({ where: { productId: id }, data: { productId: null } });
    await prisma.product.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
