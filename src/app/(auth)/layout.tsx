import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/20" />
        <Link
          href="/"
          className="absolute left-10 top-10 font-serif text-2xl tracking-[0.25em] text-ivory"
        >
          VELORA
        </Link>
        <p className="absolute bottom-10 left-10 max-w-sm font-serif text-2xl leading-snug text-ivory">
          Fine jewellery and considered fashion from independent ateliers.
        </p>
      </div>
      <div className="flex flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-10 block font-serif text-2xl tracking-[0.25em] text-charcoal lg:hidden"
          >
            VELORA
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
