import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountNav } from "@/components/account/AccountNav";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AddressManager } from "@/components/account/AddressManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const user = await requireRole("CUSTOMER");
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="mb-8 font-serif text-3xl text-charcoal sm:text-4xl">
        Hello, {user.name.split(" ")[0]}
      </h1>
      <AccountNav />

      <section className="mb-14">
        <h2 className="mb-5 font-serif text-xl text-charcoal">Your details</h2>
        <ProfileForm
          initial={{ name: user.name, email: user.email, phone: user.phone ?? "" }}
        />
      </section>

      <section>
        <AddressManager initial={addresses} />
      </section>
    </div>
  );
}
