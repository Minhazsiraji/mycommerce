'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { deleteShipment, updateShipment } from '../actions'

type Parcel = {
  id: string
  carrier: string
  trackingNumber: string | null
  shippedAt: Date
}

/**
 * The parcel list, with each row editable in place.
 *
 * A courier and tracking number typed by hand at the end of a working day are
 * going to be wrong sometimes, and a wrong tracking number is worse than none —
 * it sends the customer to a courier site that says the parcel does not exist.
 */
export function OrderParcels({ orderId, parcels }: { orderId: string; parcels: Parcel[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()

  if (parcels.length === 0) return null

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-(--color-border) p-5 text-sm">
      <h2 className="text-sm font-semibold">Parcels</h2>

      <ul className="flex flex-col gap-3">
        {parcels.map((parcel) =>
          editing === parcel.id ? (
            <li key={parcel.id}>
              <ParcelEditor
                orderId={orderId}
                parcel={parcel}
                pending={pending}
                onCancel={() => setEditing(null)}
                onSubmit={(values) => {
                  setError(undefined)
                  startTransition(async () => {
                    const result = await updateShipment({ orderId, shipmentId: parcel.id, ...values })
                    if (result.ok) setEditing(null)
                    else setError(result.error?.message)
                  })
                }}
              />
            </li>
          ) : (
            <li key={parcel.id} className="flex items-start justify-between gap-3">
              <span className="min-w-0 text-(--color-muted)">
                {parcel.carrier}
                {parcel.trackingNumber ? ` · ${parcel.trackingNumber}` : ''}
                <span className="block text-xs">{parcel.shippedAt.toLocaleDateString('en-GB')}</span>
              </span>

              <span className="flex shrink-0 gap-2 text-xs">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setEditing(parcel.id)}
                  className="underline underline-offset-4 disabled:opacity-40"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm(`Remove the ${parcel.carrier} parcel from this order?`)) return
                    setError(undefined)
                    startTransition(async () => {
                      const result = await deleteShipment({ orderId, shipmentId: parcel.id })
                      if (!result.ok) setError(result.error?.message)
                    })
                  }}
                  className="text-(--color-danger) underline underline-offset-4 disabled:opacity-40"
                >
                  Remove
                </button>
              </span>
            </li>
          ),
        )}
      </ul>

      <p className="text-xs text-(--color-muted)">
        Removing the last parcel puts the order back to processing.
      </p>

      {error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </section>
  )
}

function ParcelEditor({
  parcel,
  pending,
  onCancel,
  onSubmit,
}: {
  orderId: string
  parcel: Parcel
  pending: boolean
  onCancel: () => void
  onSubmit: (values: { carrier: string; trackingNumber: string }) => void
}) {
  const [carrier, setCarrier] = useState(parcel.carrier)
  const [tracking, setTracking] = useState(parcel.trackingNumber ?? '')

  return (
    <div className="flex flex-col gap-3">
      <Input label="Courier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
      <Input
        label="Tracking number"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          disabled={pending || !carrier.trim()}
          onClick={() => onSubmit({ carrier, trackingNumber: tracking })}
        >
          {pending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
