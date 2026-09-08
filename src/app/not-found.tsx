import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">We can't find that page</h1>
      <p className="mt-3 max-w-sm text-sm text-stone">
        The page may have moved, or the piece you're looking for is no longer available.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="bg-charcoal px-6 py-3 text-sm text-ivory">
          Back home
        </Link>
        <Link
          href="/products"
          className="border border-charcoal/30 px-6 py-3 text-sm text-charcoal hover:border-charcoal"
        >
          Shop all
        </Link>
      </div>
    </div>
  );
}
