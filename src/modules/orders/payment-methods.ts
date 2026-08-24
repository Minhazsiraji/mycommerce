export const CHECKOUT_PAYMENT_METHODS = ['cod', 'bank_transfer', 'sslcommerz'] as const

export type CheckoutPaymentMethod = (typeof CHECKOUT_PAYMENT_METHODS)[number]

/**
 * COD is an accepted order immediately, but it is not revenue until delivery.
 * Keeping a distinct payment state prevents unpaid COD orders inflating sales
 * analytics while allowing fulfilment before the courier collects the cash.
 */
export function initialPaymentState(method: CheckoutPaymentMethod) {
  if (method === 'cod') {
    return {
      orderStatus: 'confirmed' as const,
      paymentStatus: 'cod_pending' as const,
      paymentAttemptStatus: 'awaiting_collection' as const,
      holdMinutes: null,
    }
  }

  if (method === 'bank_transfer') {
    return {
      orderStatus: 'pending' as const,
      paymentStatus: 'awaiting_transfer' as const,
      paymentAttemptStatus: 'awaiting_verification' as const,
      holdMinutes: 72 * 60,
    }
  }

  return {
    orderStatus: 'pending' as const,
    paymentStatus: 'unpaid' as const,
    paymentAttemptStatus: 'pending' as const,
    holdMinutes: 30,
  }
}

export function canFulfilBeforeCollection(paymentMethod: string, paymentStatus: string) {
  return paymentMethod === 'cod' && paymentStatus === 'cod_pending'
}

/**
 * Which methods this deployment can actually take money with.
 *
 * SSLCommerz settles for Bangladeshi merchants, so it cannot be a requirement
 * of the software — a clone elsewhere, or one that has not finished onboarding,
 * previously still saw "Pay securely through SSLCommerz" at checkout and only
 * discovered the gap when a customer chose it. A method is offered when its
 * credentials exist and not otherwise.
 *
 * Cash on delivery needs no credentials, so it is the floor: a store with
 * nothing else configured can still trade.
 */
export function availablePaymentMethods(configured: {
  sslcommerz: boolean
  bankTransfer: boolean
  cod?: boolean
}): CheckoutPaymentMethod[] {
  const methods: CheckoutPaymentMethod[] = []
  if (configured.cod ?? true) methods.push('cod')
  if (configured.bankTransfer) methods.push('bank_transfer')
  if (configured.sslcommerz) methods.push('sslcommerz')
  return methods
}
