"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow mb-3">Something went wrong</p>
      <h1 className="font-serif text-3xl text-charcoal">An unexpected error occurred</h1>
      <p className="mt-3 max-w-sm text-sm text-stone">
        We've logged the issue. You can try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="bg-charcoal px-6 py-3 text-sm text-ivory">
          Try again
        </button>
        <Link
          href="/"
          className="border border-charcoal/30 px-6 py-3 text-sm text-charcoal hover:border-charcoal"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
