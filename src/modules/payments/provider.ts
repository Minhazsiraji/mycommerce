import 'server-only'

import type { SessionInput, ValidatedPayment } from './sslcommerz'

/**
 * The contract an online payment gateway implements.
 *
 * `payments/service.ts` used to import SSLCommerz's functions directly and
 * branch on `paymentMethod === 'sslcommerz'`, which made one Bangladeshi
 * gateway a structural fact of the software rather than one supported provider.
 * Adding a second gateway meant editing the order and payment core.
 *
 * The interface is deliberately the two things the core actually needs — start a
 * payment, verify one — so that a provider's own quirks (redirect shapes,
 * signature schemes, webhook formats) stay inside its adapter and its own route.
 */
export type PaymentProvider = {
  id: string
  /** Whether this deployment has the credentials to use it. */
  isConfigured: () => boolean
  createSession: (input: SessionInput) => Promise<{ redirectUrl: string }>
  /** Verifies a provider reference independently; never trusts callback bodies. */
  validatePayment: (reference: string) => Promise<ValidatedPayment>
}

const registry = new Map<string, PaymentProvider>()

export function registerPaymentProvider(provider: PaymentProvider) {
  registry.set(provider.id, provider)
}

export function providerFor(method: string): PaymentProvider | undefined {
  return registry.get(method)
}

/**
 * Whether a payment method is settled by an online gateway, as opposed to being
 * collected offline (cash on delivery, manual bank transfer).
 *
 * Callers ask this instead of naming a provider, so a store that later adds a
 * second gateway does not need every `=== 'sslcommerz'` in the codebase found
 * and updated.
 */
export function isOnlineGateway(method: string): boolean {
  return registry.has(method)
}

export function configuredGatewayIds(): string[] {
  return [...registry.values()].filter((provider) => provider.isConfigured()).map((p) => p.id)
}

/** Test seam. Production registration happens once, in `providers.ts`. */
export function resetPaymentProviders() {
  registry.clear()
}
