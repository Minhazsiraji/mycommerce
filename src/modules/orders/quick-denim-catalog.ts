import 'server-only'

import { getCachedProductBySlug, listActiveProducts } from '@/modules/catalog'
import { isQuickDenimProduct, QUICK_DENIM_UNIT_PRICE } from '@/lib/moymoy-quick-cod'

/** Discover the actual MoyMoy men's denim products, even when each colour is
 * stored as its own product. Stock and eligibility always come from the DB.
 */
export async function listQuickDenimProducts() {
  const results = await Promise.all([
    listActiveProducts({ q: 'denim', sort: 'relevance', page: 1 }, { limit: 24 }),
    listActiveProducts({ q: 'baggy', sort: 'relevance', page: 1 }, { limit: 24 }),
    listActiveProducts({ sort: 'newest', page: 1 }, { limit: 24 }),
  ])
  const found = new Map<string, string>()
  for (const result of results) {
    for (const item of result.rows) {
      if (isQuickDenimProduct(item.title) && item.totalStock > 0) {
        found.set(item.slug, item.slug)
      }
    }
  }
  const products = await Promise.all(
    [...found.keys()].map(slug => getCachedProductBySlug(slug)),
  )
  return products.filter((p): p is NonNullable<typeof p> =>
    Boolean(p && p.status === 'active' && isQuickDenimProduct(p.title) &&
      p.variants.some(v => v.price === QUICK_DENIM_UNIT_PRICE && v.stock > 0)),
  )
}
