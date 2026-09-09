import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authSeller, errorResponse, json } from "@/lib/api";
import { payoutSchema } from "@/lib/validations";

/**
 * Mock payout setup — stores bank details on the seller profile for the demo.
 * Not connected to any real bank or payment provider; no payouts are processed.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { seller } = await authSeller();
    const data = payoutSchema.parse(await req.json());

    await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: {
        payoutAccountName: data.accountName,
        payoutAccountNumber: data.accountNumber,
        payoutIfsc: data.ifsc,
        payoutsEnabled: true,
      },
    });

    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
