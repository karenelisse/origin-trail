import type { Product } from "../models/product.js";

const CACHE_MAX_AGE_DAYS = 30;

export function isProductFresh(
  product: Product,
): boolean {
  const checkedAt = new Date(product.checked_at);
  const now = new Date();

  const maxAgeMs =
    CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  return now.getTime() - checkedAt.getTime() < maxAgeMs;
}
