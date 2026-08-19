'use server'

import { redirect } from 'next/navigation'

import { startGatewayPayment, switchToBankTransfer } from './actions'

/**
 * Form-action wrapper for the order page.
 *
 * The order detail subtree is intentionally treated as non-hydrating until the
 * underlying Next/React issue is resolved, so recovery controls must work with
 * ordinary HTML form submission rather than onClick/useTransition.
 */
export async function startGatewayPaymentFromOrder(orderNumber: string): Promise<never> {
  const result = await startGatewayPayment(orderNumber)

  if (!result.ok) {
    redirect(`/orders/${encodeURIComponent(orderNumber)}?paymentError=gateway`)
  }

  redirect(result.data.redirectUrl)
}

export async function switchOrderToBankTransfer(orderNumber: string): Promise<never> {
  const result = await switchToBankTransfer(orderNumber)

  if (!result.ok) {
    redirect(`/orders/${encodeURIComponent(orderNumber)}?paymentError=transfer`)
  }

  redirect(`/orders/${encodeURIComponent(orderNumber)}`)
}
