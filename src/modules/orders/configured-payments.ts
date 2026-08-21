import 'server-only'

import { env } from '@/lib/env'

import { availablePaymentMethods, type CheckoutPaymentMethod } from './payment-methods'

/**
 * The payment methods this deployment has credentials for.
 *
 * Kept apart from `payment-methods.ts` so that the pure decision stays testable
 * and importable by client components, while the credential reads stay on the
 * server. A store's gateway password must never be the reason a module cannot
 * be unit tested.
 */
export function configuredPaymentMethods(): CheckoutPaymentMethod[] {
  return availablePaymentMethods({
    sslcommerz: Boolean(env.SSLCOMMERZ_STORE_ID && env.SSLCOMMERZ_STORE_PASSWORD),
    bankTransfer: Boolean(env.BANK_ACCOUNT_NAME && env.BANK_ACCOUNT_NUMBER && env.BANK_NAME),
  })
}
