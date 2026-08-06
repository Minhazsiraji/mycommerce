import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'

import { withDbRetry } from '@/lib/db/retry'

import { deliveryEstimate, lowestFreeThreshold } from './service'
import { SHIPPING_TAGS } from './tags'

/**
 * The delivery facts shown on every storefront page, cached.
 *
 * This exists because the trust bar lives in the shop layout, and the layout is
 * prerendered. An uncached database read there makes *every* storefront page
 * blocking — "Uncached data was accessed outside of `<Suspense>`" — and giving
 * it its own Suspense boundary only trades that for a build failure, because
 * the Neon driver's WebSocket handshake wants random bytes during prerender.
 *
 * Caching is the honest answer rather than a workaround: delivery rates change
 * a few times a year, and freshness is driven by the tag the shipping actions
 * clear, so there is no stale window to reason about.
 *
 * Wrapped in `withDbRetry` for the same reason the catalog reads are — this
 * runs during prerendering, where a dropped socket fails the build, not just
 * one request.
 */
export async function getCachedDeliverySummary() {
  'use cache'
  cacheTag(SHIPPING_TAGS.rates)
  cacheLife('max')

  const [freeOver, estimate] = await withDbRetry(() =>
    Promise.all([lowestFreeThreshold(), deliveryEstimate()]),
  )

  return { freeOver, estimate }
}
