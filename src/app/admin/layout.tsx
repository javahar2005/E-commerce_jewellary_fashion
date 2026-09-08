import { requireRole } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  return (
    <div className="flex min-h-screen flex-col bg-ivory lg:flex-row">
      <AdminNav />
      <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
