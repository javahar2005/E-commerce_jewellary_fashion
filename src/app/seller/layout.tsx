import { requireRole } from "@/lib/auth";
import { SellerNav } from "@/components/seller/SellerNav";

export const dynamic = "force-dynamic";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("SELLER");
  return (
    <div className="flex min-h-screen flex-col bg-ivory lg:flex-row">
      <SellerNav storeName={user.sellerProfile?.storeName ?? "Store"} />
      <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
