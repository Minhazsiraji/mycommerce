import { formatBdt } from '@/lib/money'

import {
  startGatewayPaymentFromOrder,
  switchOrderToBankTransfer,
} from '../progressive-actions'

/**
 * Payment recovery that works without client hydration.
 *
 * Server Actions used as native form actions retain progressive enhancement:
 * the browser can submit them even when the surrounding order page never
 * hydrates. This is deliberately separate from the interactive PayNowButton,
 * which remains available elsewhere if a hydrated surface needs it.
 */
export function PayNowPanel({
  orderNumber,
  amount,
  errorCode,
}: {
  orderNumber: string
  amount: number
  errorCode?: string
}) {
  const pay = startGatewayPaymentFromOrder.bind(null, orderNumber)
  const transfer = switchOrderToBankTransfer.bind(null, orderNumber)
  const error =
    errorCode === 'gateway'
      ? 'Online payment could not be opened. Try again, or use bank transfer.'
      : errorCode === 'transfer'
        ? 'We could not switch this order to bank transfer. Please try again.'
        : null

  return (
    <div className="storefront-card flex flex-col gap-3 p-5">
      <h2 className="text-sm font-semibold">Pay {formatBdt(amount)}</h2>
      <p className="text-sm text-(--color-muted)">
        You will be taken to SSLCommerz to pay by card, bKash, Nagad, Rocket or internet banking.
      </p>

      {error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}

      <form action={pay}>
        <button
          type="submit"
          className="h-11 rounded-md bg-(--color-accent) px-6 text-sm font-medium text-(--color-accent-fg) transition-opacity hover:opacity-90"
        >
          Pay now
        </button>
      </form>

      <div className="border-t border-(--color-border) pt-3">
        <form action={transfer}>
          <button type="submit" className="text-sm underline underline-offset-4">
            Pay by bank transfer instead
          </button>
        </form>
      </div>
    </div>
  )
}
