"use client";

import { useEffect } from "react";
import { api } from "@/lib/client";
import { addLocalViewed } from "@/lib/localHistory";

/** Fire-and-forget: records a product view for the current customer / guest. */
export function RecordProductView({ productId }: { productId: string }) {
  useEffect(() => {
    addLocalViewed(productId);
    api("/api/recently-viewed", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }).catch(() => {});
  }, [productId]);

  return null;
}
