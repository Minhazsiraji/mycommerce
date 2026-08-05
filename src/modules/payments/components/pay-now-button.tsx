'use client'

import { useState, useTransition } from 'react'

import { formatBdt } from '@/lib/money'

import { startGatewayPayment } from '../actions'

export function PayNowButton({ orderNumber, amount }: { orderNumber: string; amount: number }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()

  function pay() {
    setError(undefined)

    startTransition(async () => {
      const result = await startGatewayPayment(orderNumber)

      if (!result.ok) {
        setError(result.error.message)
        return
      }

      // Full navigation, not router.push — the gateway is another origin.
      window.location.href = result.data.redirectUrl
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
      <h2 className="text-sm font-semibold">Pay {formatBdt(amount)}</h2>
      <p className="text-sm text-(--color-muted)">
        You will be taken to SSLCommerz to pay by card, bKash, Nagad, Rocket or internet banking.
      </p>

      <button
        type="button"
        onClick={pay}
        disabled={pending}
        className="h-11 self-start rounded-md bg-(--color-accent) px-6 text-sm font-medium text-(--color-accent-fg) transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {pending ? 'Opening…' : 'Pay now'}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </div>
  )
}
