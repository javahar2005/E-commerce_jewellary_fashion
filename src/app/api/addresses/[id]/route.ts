import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authUser, errorResponse, json, ApiError } from "@/lib/api";
import { addressSchema } from "@/lib/validations";

async function own(userId: string, id: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new ApiError(404, "Address not found");
  return address;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authUser();
    const { id } = await params;
    await own(user.id, id);
    const data = addressSchema.parse(await req.json());

    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault ?? false,
      },
    });
    return json(address);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authUser();
    const { id } = await params;
    const address = await own(user.id, id);

    // Keep referential integrity: orders reference addressId with onDelete restrict by default.
    const usedByOrder = await prisma.order.findFirst({ where: { addressId: id }, select: { id: true } });
    if (usedByOrder) {
      throw new ApiError(409, "This address is linked to an order and cannot be deleted");
    }

    await prisma.address.delete({ where: { id } });

    if (address.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }

    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
