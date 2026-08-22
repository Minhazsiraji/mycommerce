'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { CURRENCY } from '@/lib/money'

import { addToCart } from '../actions'
import { newBrowserEventId, trackBrowserEvent } from '@/modules/meta/components/client'

/**
 * Deliberately not optimistic.
 *
 * An optimistic "Added" that later turns out to have failed on stock is worse
 * than a brief spinner — the customer walks to checkout believing they have the
 * item. The server's answer is the only one shown.
 */
export function AddToCartButton({
  variantId,
  disabled,
  className = '',
  children = 'Add to cart',
  contentName,
  unitPrice,
}: {
  variantId: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  contentName: string
  unitPrice: number
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<'idle' | 'added'>('idle')
  const [error, setError] = useState<string>()

  function onClick() {
    setError(undefined)

    startTransition(async () => {
      const eventId = newBrowserEventId('addtocart')
      const result = await addToCart({ variantId, quantity: 1, eventId })

      if (!result.ok) {
        setError(result.error.message)
        return
      }

      setState('added')
      trackBrowserEvent(
        'AddToCart',
        {
          content_ids: [variantId],
          content_name: contentName,
          content_type: 'product',
          contents: [{ id: variantId, quantity: 1, item_price: unitPrice }],
          currency: CURRENCY,
          value: unitPrice,
        },
        eventId,
      )
      // Refreshes the header badge, which is a separate server component.
      router.refresh()
      setTimeout(() => setState('idle'), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || pending}
        className={`h-11 rounded-md bg-(--color-accent) px-6 text-sm font-medium text-(--color-accent-fg) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      >
        {pending ? 'Adding…' : state === 'added' ? 'Added ✓' : children}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </div>
  )
}
