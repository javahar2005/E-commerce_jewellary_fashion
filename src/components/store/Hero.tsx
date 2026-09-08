"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DESKTOP_SRC =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=2000&q=80";
const MOBILE_SRC =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1100&h=1450&q=80";

export function Hero() {
  const imgWrapRef = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Very subtle parallax: image drifts as the hero scrolls away.
  useEffect(() => {
    const el = imgWrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const shift = Math.min(window.scrollY * 0.12, 60);
        el.style.transform = `translate3d(0, ${shift}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const rc = cn("reveal", entered && "is-in");
  const d = (ms: number): React.CSSProperties => ({ transitionDelay: `${ms}ms` });

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-charcoal">
      <div ref={imgWrapRef} className="absolute inset-0 -z-10 h-[112%] w-full will-change-transform">
        <picture>
          <source media="(min-width: 768px)" srcSet={DESKTOP_SRC} />
          <img
            src={MOBILE_SRC}
            alt="A Velora editorial portrait — considered jewellery, worn simply"
            className="hero-drift h-full w-full object-cover object-[58%_26%] sm:object-[50%_30%]"
          />
        </picture>
      </div>

      {/* Legibility scrim — heavier at the lower-left where the type sits,
          plus a whisper at the top so the overlaid navbar stays readable */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal/50 via-transparent to-transparent" />
      <div className="absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-charcoal/45 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <div className="max-w-xl">
          <p className={cn(rc, "eyebrow text-ivory/70")} style={d(120)}>
            Velora — The Collection
          </p>
          <h1
            className={cn(
              rc,
              "mt-5 font-serif text-[2.7rem] leading-[1.04] text-ivory sm:text-6xl lg:text-[4.6rem]",
            )}
            style={d(260)}
          >
            Made to be remembered.
          </h1>
          <p
            className={cn(rc, "mt-5 max-w-md text-[0.95rem] leading-relaxed text-ivory/75")}
            style={d(440)}
          >
            Discover pieces chosen for everyday elegance and unforgettable moments.
          </p>
          <div className={cn(rc, "mt-9")} style={d(600)}>
            <Link
              href="/products"
              className="cta-link group inline-flex items-center gap-3 border border-ivory/50 px-7 py-3.5 text-sm tracking-wide text-ivory transition-colors duration-300 hover:border-ivory hover:bg-ivory hover:text-charcoal"
            >
              Explore Collection
              <span className="cta-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <span className="eyebrow text-ivory/35">Scroll</span>
      </div>
    </section>
  );
}
