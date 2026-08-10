'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { formatBdt } from '@/lib/money'

import { startGatewayPayment, switchToBankTransfer } from '../actions'

export function PayNowButton({ orderNumber, amount }: { orderNumber: string; amount: number }) {
  const router = useRouter()
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

  function switchToTransfer() {
    setError(undefined)

    startTransition(async () => {
      const result = await switchToBankTransfer(orderNumber)
      if (!result.ok) setError(result.error.message)
      else router.refresh()
    })
  }

  return (
    <div className="storefront-card flex flex-col gap-3 p-5">
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

      {/*
        Always offered, not only after a failure. The cart was consumed when the
        order was created, so a customer who cannot complete card payment would
        otherwise be stranded with an order they cannot pay for and an empty
        cart to go back to.
      */}
      <div className="border-t border-(--color-border) pt-3">
        <button
          type="button"
          onClick={switchToTransfer}
          disabled={pending}
          className="text-sm underline underline-offset-4 disabled:opacity-40"
        >
          Pay by bank transfer instead
        </button>
      </div>
    </div>
  )
}
