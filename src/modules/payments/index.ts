/**
 * Public API of the payments module. Server-side only — client components
 * import `./actions` directly.
 */

/**
 * Registers the configured gateways. Imported here rather than only in
 * `service.ts` so that any consumer of this module sees a populated registry —
 * otherwise a page asking `isOnlineGateway` before the service happened to load
 * would be told "no", and the customer's Pay Now button would silently vanish.
 */
import './providers'

export { configuredGatewayIds, isOnlineGateway, providerFor } from './provider'
export type { PaymentProvider as OnlinePaymentProvider } from './provider'

export {
  confirmTransfer,
  rejectTransfer,
  startGatewayPayment,
  submitTransferReference,
} from './actions'

export {
  handleGatewayNotification,
  listPendingTransfers,
  PaymentError,
} from './service'
export { reconcileGatewayOrder } from './reconciliation'
export { CallbackPayloadTooLarge, readCallbackForm } from './callback-form'

export type { GatewayReconciliationResult } from './reconciliation'
export type { Payment, PaymentProvider } from './schema'
export { PAYMENT_PROVIDERS } from './schema'
