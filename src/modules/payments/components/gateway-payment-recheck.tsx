'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'

import { reconcileGatewayOrderForAdmin } from '../reconciliation-actions'

export function GatewayPaymentRecheck({ orderNumber }: { orderNumber: string }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-(--color-border) p-5">
      <h2 className="text-sm font-semibold">Online payment verification</h2>
      <p className="text-xs text-(--color-muted)">
        Checks SSLCommerz directly. This cannot manually force an order to paid.
      </p>
      <Button
        type="button"
        className="self-start"
        disabled={pending}
        onClick={() => {
          setMessage(undefined)
          setError(undefined)
          startTransition(async () => {
            const result = await reconcileGatewayOrderForAdmin(orderNumber)
            if (!result.ok) {
              setError(result.error?.message ?? 'Payment check failed.')
              return
            }

            const outcome = result.data.result
            setMessage(
              outcome === 'pending'
                ? 'SSLCommerz has not reported a successful payment for this order yet.'
                : outcome === 'late-cancelled'
                  ? 'Payment was found, but the order had already been cancelled after its stock hold expired.'
                  : 'Payment status checked successfully. The order will refresh with the verified state.',
            )
          })
        }}
      >
        {pending ? 'Checking SSLCommerz…' : 'Check payment with SSLCommerz'}
      </Button>
      {message ? <p className="text-xs text-(--color-muted)">{message}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </div>
  )
}
