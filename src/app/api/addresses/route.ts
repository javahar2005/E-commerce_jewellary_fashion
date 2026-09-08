import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authUser, errorResponse, json } from "@/lib/api";
import { addressSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await authUser();
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return json(addresses);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authUser();
    const data = addressSchema.parse(await req.json());

    const count = await prisma.address.count({ where: { userId: user.id } });
    const makeDefault = data.isDefault || count === 0;

    if (makeDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: makeDefault,
      },
    });
    return json(address, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
