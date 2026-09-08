import { PageLoader } from "@/components/ui/States";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <PageLoader label="Loading pieces" />
    </div>
  );
}
