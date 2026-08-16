'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { addShipment, cancelOrder, setFulfillmentStatus } from '../actions'

const STAGES = ['unfulfilled', 'processing', 'shipped', 'delivered'] as const

export function OrderAdminActions({
  orderId,
  fulfillmentStatus,
  cancelled,
  paid,
}: {
  orderId: string
  fulfillmentStatus: string
  cancelled: boolean
  paid: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const [carrier, setCarrier] = useState('')
  const [tracking, setTracking] = useState('')

  function run(fn: () => Promise<{ ok: boolean; error?: { message: string } }>) {
    setError(undefined)
    startTransition(async () => {
      const result = await fn()
      if (!result.ok) setError(result.error?.message)
    })
  }

  if (cancelled) {
    return (
      <p className="rounded-lg bg-(--color-danger)/10 px-4 py-3 text-sm text-(--color-danger)">
        This order is cancelled. Reserved stock was returned; any refund is made through your bank
        or SSLCommerz and recorded there, not here.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Fulfilment</h2>

        <div className="flex flex-wrap gap-2">
          {STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              disabled={
                pending ||
                stage === fulfillmentStatus ||
                (fulfillmentStatus === 'shipped' &&
                  (stage === 'unfulfilled' || stage === 'processing')) ||
                fulfillmentStatus === 'delivered'
              }
              onClick={() => run(() => setFulfillmentStatus({ orderId, status: stage }))}
              className={`rounded-md border px-3 py-1.5 text-sm capitalize transition-colors disabled:cursor-default ${
                stage === fulfillmentStatus
                  ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-fg)'
                  : 'border-(--color-border) hover:bg-(--color-surface) disabled:opacity-40'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        {!paid ? (
          <p className="text-xs text-(--color-danger)">
            Confirm payment before shipping. Unpaid orders cannot be marked shipped or receive a
            parcel.
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-3 border-t border-(--color-border) pt-6">
        <h2 className="text-sm font-semibold">Record a parcel</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Courier"
            placeholder="Pathao, Steadfast, RedX…"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
          />
          <Input
            label="Tracking number (optional)"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
        </div>

        <Button
          type="button"
          className="self-start"
          disabled={pending || !carrier || !paid || fulfillmentStatus === 'delivered'}
          onClick={() =>
            run(async () => {
              const result = await addShipment({ orderId, carrier, trackingNumber: tracking })
              if (result.ok) {
                setCarrier('')
                setTracking('')
              }
              return result
            })
          }
        >
          {pending ? 'Saving…' : 'Add parcel'}
        </Button>

        <p className="text-xs text-(--color-muted)">
          {paid
            ? 'Adding a parcel marks the order shipped — one action, not two.'
            : 'This unlocks after payment is confirmed.'}
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-(--color-border) pt-6">
        <h2 className="text-sm font-semibold">Cancel</h2>

        <Button
          type="button"
          variant="ghost"
          className="self-start text-(--color-danger)"
          disabled={pending || fulfillmentStatus === 'shipped' || fulfillmentStatus === 'delivered'}
          onClick={() => {
            const reason = prompt('Why is this order being cancelled?')
            if (!reason) return
            run(() => cancelOrder({ orderId, reason }))
          }}
        >
          Cancel order
        </Button>

        <p className="text-xs text-(--color-muted)">
          {fulfillmentStatus === 'shipped' || fulfillmentStatus === 'delivered'
            ? 'A shipped order needs a separate return/refund process and cannot be cancelled here.'
            : 'Returns reserved stock. A real refund remains a separate step through your bank or SSLCommerz.'}
        </p>
      </section>

      {error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </div>
  )
}
