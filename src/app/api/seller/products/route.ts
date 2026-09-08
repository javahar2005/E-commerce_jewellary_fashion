import { NextRequest } from "next/server";
import { authSeller, errorResponse, json } from "@/lib/api";
import { productSchema } from "@/lib/validations";
import { createSellerProduct } from "@/lib/sellerProducts";

export async function POST(req: NextRequest) {
  try {
    const { seller } = await authSeller();
    const data = productSchema.parse(await req.json());
    const product = await createSellerProduct(seller.id, data);
    return json({ ok: true, id: product.id }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
