import 'server-only'

import { env } from '@/lib/env'

import { registerPaymentProvider } from './provider'
import { createSession, validatePayment } from './sslcommerz'

/**
 * Where gateways are wired in. Importing this module registers them.
 *
 * A second gateway is added here and nowhere else in the order, checkout or
 * payment core: implement the adapter, register it below, add its webhook route
 * and its credentials. Nothing in `service.ts` branches on which one it is.
 */
registerPaymentProvider({
  id: 'sslcommerz',
  isConfigured: () => Boolean(env.SSLCOMMERZ_STORE_ID && env.SSLCOMMERZ_STORE_PASSWORD),
  createSession,
  validatePayment,
})
