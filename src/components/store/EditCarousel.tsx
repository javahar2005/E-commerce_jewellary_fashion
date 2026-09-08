"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type EditSlide = {
  index: string; // "01"
  label: string; // "Jewellery"
  title: string; // headline
  copy: string;
  href: string;
  image: string;
};

export function EditCarousel({ slides }: { slides: EditSlide[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const drag = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[0] as HTMLElement | undefined;
    if (!child) return;
    const slideW = child.getBoundingClientRect().width + 24; // gap-6
    setActive(Math.round(el.scrollLeft / slideW));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [measure]);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, slides.length - 1));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, [slides.length]);

  // Pointer drag (mouse). Touch uses native scrolling.
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "touch") return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const el = trackRef.current;
    if (!el || !drag.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  }
  function onPointerUp(e: React.PointerEvent) {
    const el = trackRef.current;
    const wasDragging = drag.current?.moved;
    drag.current = null;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (wasDragging) {
      measure();
      const el2 = trackRef.current;
      if (el2) {
        const child = el2.children[0] as HTMLElement | undefined;
        const slideW = (child?.getBoundingClientRect().width ?? 1) + 24;
        goTo(Math.round(el2.scrollLeft / slideW));
      }
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">The Edit</p>
          <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">
            Curated pieces for every expression of your style.
          </h2>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <CarouselArrow dir="prev" onClick={() => goTo(active - 1)} disabled={active === 0} />
          <CarouselArrow
            dir="next"
            onClick={() => goTo(active + 1)}
            disabled={active === slides.length - 1}
          />
        </div>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="no-scrollbar snap-x-mandatory -mx-4 flex cursor-grab gap-6 overflow-x-auto px-4 pb-1 active:cursor-grabbing sm:mx-0 sm:px-0"
      >
        {slides.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            draggable={false}
            onClick={(e) => {
              if (drag.current?.moved) e.preventDefault();
            }}
            className="snap-start group relative block w-[86%] shrink-0 overflow-hidden sm:w-[78%] lg:w-[72%]"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-beige sm:aspect-[16/10]">
              <img
                src={s.image}
                alt={s.title}
                draggable={false}
                className="h-full w-full select-none object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/5" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-ivory sm:p-10">
                <p className="eyebrow text-ivory/80 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
                  {s.index} / {String(slides.length).padStart(2, "0")} · {s.label}
                </p>
                <h3 className="mt-2 max-w-md font-serif text-2xl leading-tight sm:text-4xl [text-shadow:0_2px_20px_rgba(0,0,0,0.35)]">
                  {s.title}
                </h3>
                <p className="mt-2 hidden max-w-sm text-sm text-ivory/80 sm:block">{s.copy}</p>
                <span className="cta-link mt-4 inline-flex items-center gap-2 text-sm tracking-wide text-ivory">
                  Discover
                  <span className="cta-arrow" aria-hidden>→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-5 flex items-center gap-3">
        <span className="text-xs tabular-nums text-stone">
          {String(active + 1).padStart(2, "0")}
        </span>
        <div className="relative h-px flex-1 bg-charcoal/12">
          <div
            className="absolute inset-y-0 left-0 bg-charcoal/60 transition-[width] duration-500 ease-out"
            style={{ width: `${((active + 1) / slides.length) * 100}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-stone">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function CarouselArrow({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-10 w-10 items-center justify-center border border-charcoal/25 text-charcoal transition-colors duration-300",
        disabled ? "opacity-30" : "hover:border-charcoal hover:bg-charcoal hover:text-ivory",
      )}
    >
      {dir === "prev" ? "←" : "→"}
    </button>
  );
}
