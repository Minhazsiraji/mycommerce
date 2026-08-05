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

export type { ShippingRate } from './schema'
export { shippingRateInputSchema, type ShippingRateInput } from './validators'
