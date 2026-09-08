import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AddressManager } from "@/components/account/AddressManager";

export const dynamic = "force-dynamic";

export default async function SellerProfilePage() {
  const user = await requireRole("SELLER");
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

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
            storeName: user.sellerProfile?.storeName ?? "",
            bio: user.sellerProfile?.bio ?? "",
          }}
        />
      </section>

      <section className="mt-12">
        <AddressManager initial={addresses} />
      </section>
    </div>
  );
}
