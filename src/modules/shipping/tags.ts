/**
 * Cache tag for delivery rates, shared by the cached read and the actions that
 * invalidate it. Same reasoning as `catalog/tags.ts`: a tag is a contract
 * between two files that never import each other, and a mismatch does not
 * error — it just serves stale prices forever.
 */
export const SHIPPING_TAGS = {
  rates: 'shipping:rates',
} as const
