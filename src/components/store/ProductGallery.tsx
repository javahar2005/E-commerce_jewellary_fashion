"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: { url: string }[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ url: "" }];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {list.length > 1 && (
        <div className="flex gap-3 sm:flex-col">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden border sm:h-20 sm:w-20",
                i === active ? "border-charcoal" : "border-charcoal/15 hover:border-charcoal/40",
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-beige">
        {list[active].url ? (
          <img src={list[active].url} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone">
            No image available
          </div>
        )}
      </div>
    </div>
  );
}
