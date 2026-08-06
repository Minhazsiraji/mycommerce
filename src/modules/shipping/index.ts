/**
 * Public API of the shipping module. Server-side only — client components
 * import `./actions` or `./validators` directly.
 */

export {
  createShippingRate,
  deleteShippingRate,
  updateShippingRate,
} from './actions'

export {
  deliveryEstimate,
  lowestFreeThreshold,
  quoteRates,
  resolveRate,
  ShippingError,
  type QuotedRate,
} from './service'

export { listActiveRates, listRates } from './repository'

/** Cached read for the storefront. Invalidated by tag from the actions. */
export { getCachedDeliverySummary } from './cached'
export { SHIPPING_TAGS } from './tags'

export type { ShippingRate } from './schema'
export { shippingRateInputSchema, type ShippingRateInput } from './validators'
