/**
 * Public API of the orders module. Server-side only — client components import
 * `./actions` or `./validators` directly.
 */

export { placeOrder } from './actions'

export {
  CheckoutError,
  OutOfStockError,
  findGuestOrder,
  getVisibleOrder,
  listExpiredHolds,
  listMyOrders,
  markPaid,
  releaseHold,
} from './service'

export type { AddressSnapshot, Order, OrderItem } from './schema'
export { placeOrderSchema, guestLookupSchema, type PlaceOrderInput } from './validators'
