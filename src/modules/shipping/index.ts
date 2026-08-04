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

export { listRates } from './repository'

export type { ShippingRate } from './schema'
export { BD_DISTRICTS, shippingRateInputSchema, type ShippingRateInput } from './validators'
