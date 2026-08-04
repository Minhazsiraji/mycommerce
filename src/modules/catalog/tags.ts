/**
 * Cache tags shared by the cached reads and the actions that invalidate them.
 *
 * They live here because a tag is a contract between two files that never
 * import each other: if a read tags `catalog:products` and an action clears
 * `products:list`, nothing errors — the page just silently serves stale data
 * forever. Constants make that impossible.
 *
 * Deliberately coarse. Per-product tags sound tidier, but for a single store
 * with a few thousand SKUs, rebuilding the catalog's cached reads after an edit
 * costs milliseconds, and the granularity would only add ways to get it wrong.
 */
export const CATALOG_TAGS = {
  products: 'catalog:products',
  categories: 'catalog:categories',
} as const
