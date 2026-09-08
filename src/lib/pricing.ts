/**
 * Single source of truth for a product's final selling price.
 * Keep this identical to the SQL used to persist `Product.effectivePrice`:
 *   ROUND(price * (100 - discount) / 100)
 */
export function effectivePrice(price: number, discount: number): number {
  const d = Number.isFinite(discount) ? Math.min(Math.max(discount, 0), 100) : 0;
  if (d <= 0) return price;
  return Math.round((price * (100 - d)) / 100);
}

/** True when the product genuinely sells for less than its list price. */
export function hasRealDiscount(price: number, discount: number): boolean {
  return discount > 0 && effectivePrice(price, discount) < price;
}
