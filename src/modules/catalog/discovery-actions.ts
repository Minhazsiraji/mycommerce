'use server'

import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'

import { ok, type ActionResult } from '@/lib/action-result'
import { db } from '@/lib/db'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import { products } from './schema'
import { CATALOG_TAGS } from './tags'

/**
 * Opts every currently-active product into discovery consideration.
 *
 * This does not bypass readiness validation: products with missing descriptions,
 * images, variants, brand/category data, or identifier problems remain blocked by
 * getDiscoveryReadiness() and are not emitted by the validated CSV feed.
 * Archived/draft products are intentionally untouched.
 */
export async function includeAllActiveProductsInDiscovery(): Promise<
  ActionResult<{ count: number }>
> {
  const admin = await requireRole('admin')

  const rows = await db
    .update(products)
    .set({ discoveryEligible: true, updatedAt: new Date() })
    .where(eq(products.status, 'active'))
    .returning({ id: products.id })

  await recordAudit(admin, {
    action: 'product.discovery_bulk_enabled',
    entityType: 'product',
    detail: { count: rows.length, scope: 'active_products_only' },
  })

  updateTag(CATALOG_TAGS.products)
  return ok({ count: rows.length })
}
