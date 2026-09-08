import { getSession } from "@/lib/session";
import { getNavCounts } from "@/lib/counts";
import { prisma } from "@/lib/prisma";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const session = await getSession();
  const counts = await getNavCounts(
    session?.role === "CUSTOMER" ? session.userId : undefined,
  );
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true, group: true },
  });

  return (
    <NavbarClient
      session={
        session
          ? { name: session.name, role: session.role }
          : null
      }
      counts={counts}
      categories={categories}
    />
  );
}
