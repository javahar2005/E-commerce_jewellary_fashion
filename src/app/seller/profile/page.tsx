import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getSellerEarnings, COMMISSION_RATE } from "@/lib/payouts";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AddressManager } from "@/components/account/AddressManager";
import { PayoutSetup } from "@/components/seller/PayoutSetup";
import { StatCard } from "@/components/ui/StatCard";

export const dynamic = "force-dynamic";

export default async function SellerProfilePage() {
  const user = await requireRole("SELLER");
  const seller = user.sellerProfile!;

  const [addresses, earnings] = await Promise.all([
    prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    getSellerEarnings(seller.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Profile</h1>
      <p className="mt-1 text-sm text-stone">Your account and store details.</p>

      <section className="mt-8">
        <h2 className="mb-4 font-serif text-lg text-charcoal">Details</h2>
        <ProfileForm
          showStore
          initial={{
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
            storeName: seller.storeName,
            bio: seller.bio ?? "",
          }}
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-1 font-serif text-lg text-charcoal">Payouts</h2>
        <p className="mb-4 text-sm text-stone">
          Set up where your earnings would be paid, and see your earnings so far.
        </p>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total sales" value={formatPrice(earnings.totalSales)} />
          <StatCard
            label={`Marketplace commission (${Math.round(COMMISSION_RATE * 100)}%)`}
            value={`− ${formatPrice(earnings.commission)}`}
          />
          <StatCard label="Your earnings" value={formatPrice(earnings.earnings)} />
        </div>

        <PayoutSetup
          initial={{
            accountName: seller.payoutAccountName ?? "",
            accountNumber: seller.payoutAccountNumber ?? "",
            ifsc: seller.payoutIfsc ?? "",
            enabled: seller.payoutsEnabled,
          }}
        />
      </section>

      <section className="mt-12">
        <AddressManager initial={addresses} />
      </section>
    </div>
  );
}
