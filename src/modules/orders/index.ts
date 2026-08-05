/**
 * Public API of the orders module. Server-side only — client components import
 * `./actions` or `./validators` directly.
 */

export { addShipment, cancelOrder, placeOrder, setFulfillmentStatus } from './actions'

export {
  getOrderById,
  listOrdersForAdmin,
  listShipments,
  ORDERS_PAGE_SIZE,
} from './repository'

export { orderFiltersSchema, type OrderFilters } from './validators'

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
