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
  const moymoyStore = process.env.STORE_SOCIAL_COMMERCE_MODE?.trim() === 'true'

  return availablePaymentMethods({
    // MoyMoy intentionally uses only COD + manual bKash/bank transfer.
    // Old clone SSLCommerz credentials must never leak into this storefront.
    sslcommerz: moymoyStore
      ? false
      : Boolean(env.SSLCOMMERZ_STORE_ID && env.SSLCOMMERZ_STORE_PASSWORD),
    bankTransfer: Boolean(env.BANK_ACCOUNT_NAME && env.BANK_ACCOUNT_NUMBER && env.BANK_NAME),
    manualBkash: Boolean(env.BKASH_NUMBER),
    // Opt-out rather than opt-in: a store that says nothing keeps trading.
    cod: process.env.STORE_COD_ENABLED?.trim() !== 'false',
  })
}
