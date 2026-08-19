import 'server-only'

import { asc, eq, isNull } from 'drizzle-orm'

import { db } from '@/lib/db'

import { productImages, products, productVariants } from './schema'

/**
 * The Merchant feed is a catalogue projection, not a second source of truth.
 * It intentionally reads only active products and non-archived variants.
 */
export function listMerchantFeedProducts() {
  return db.query.products.findMany({
    where: eq(products.status, 'active'),
    orderBy: [asc(products.title), asc(products.id)],
    with: {
      category: true,
      variants: {
        where: isNull(productVariants.archivedAt),
        orderBy: [asc(productVariants.position), asc(productVariants.sku)],
      },
      images: {
        orderBy: [asc(productImages.position), asc(productImages.id)],
      },
    },
  })
}
