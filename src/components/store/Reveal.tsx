"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its children with a soft opacity + translate transition when it
 * scrolls into view (or immediately, for above-the-fold content).
 * CSS in globals.css does the work; this only toggles `.is-in`.
 * Honours prefers-reduced-motion (CSS falls back to no animation).
 */
export function Reveal({
  children,
  className,
  as,
  delay = 0,
  variant = "block",
  immediate = false,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  variant?: "block" | "image";
  immediate?: boolean;
  once?: boolean;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(immediate);

  useEffect(() => {
    // Skip the entrance animation for automated agents / crawlers, or when
    // IntersectionObserver is unavailable — content must never stay hidden.
    const isBot = typeof navigator !== "undefined" && navigator.webdriver;
    const el = ref.current;
    if (immediate || isBot || !el || typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setInView(true), immediate ? 40 : 0);
      return () => clearTimeout(t);
    }
    // Failsafe: never leave content hidden if the observer misfires.
    const failsafe = setTimeout(() => setInView(true), 2500);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            clearTimeout(failsafe);
            if (once) obs.disconnect();
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => {
      clearTimeout(failsafe);
      obs.disconnect();
    };
  }, [immediate, once]);

  return (
    <Tag
      ref={ref}
      className={cn(variant === "image" ? "reveal-img" : "reveal", inView && "is-in", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
