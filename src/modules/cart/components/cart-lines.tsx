'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useOptimistic, useState, useTransition } from 'react'

import { formatBdt } from '@/lib/money'

import { removeLine, updateLineQuantity } from '../actions'
import { MAX_LINE_QUANTITY } from '../validators'

export type CartLineView = {
  id: string
  productSlug: string
  productTitle: string
  variantTitle: string | null
  imageUrl: string | null
  unitPrice: number
  addedPrice: number
  quantity: number
  availableStock: number
  unavailable: boolean
  lineTotal: number
}

export function CartLines({ lines }: { lines: CartLineView[] }) {
  return (
    <ul className="flex flex-col divide-y divide-(--color-border) border-y border-(--color-border)">
      {lines.map((line) => (
        <CartLineRow key={line.id} line={line} />
      ))}
    </ul>
  )
}

function CartLineRow({ line }: { line: CartLineView }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()

  /**
   * The action sets an absolute quantity rather than incrementing, so the next
   * value must be computed from what the customer currently sees. Reading it
   * from props loses clicks: press + twice quickly and both requests compute
   * from the same stale number, so two clicks add one. Tracking it optimistically
   * both fixes that and makes the button feel immediate.
   */
  const [quantity, setQuantity] = useOptimistic(line.quantity)

  function changeQuantity(next: number) {
    setError(undefined)
    startTransition(async () => {
      setQuantity(next)
      const result = await updateLineQuantity({ lineId: line.id, quantity: next })
      if (!result.ok) setError(result.error.message)
    })
  }

  function remove() {
    setError(undefined)
    startTransition(async () => {
      setQuantity(0)
      const result = await removeLine({ lineId: line.id })
      if (!result.ok) setError(result.error.message)
    })
  }

  const priceChanged = line.unitPrice !== line.addedPrice
  const overStock = !line.unavailable && line.availableStock < line.quantity

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/p/${line.productSlug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-md bg-(--color-surface)"
      >
        {line.imageUrl ? (
          <Image src={line.imageUrl} alt="" fill sizes="80px" className="object-cover" />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link href={`/p/${line.productSlug}`} className="text-sm font-medium hover:underline">
          {line.productTitle}
        </Link>
        {line.variantTitle ? (
          <span className="text-xs text-(--color-muted)">{line.variantTitle}</span>
        ) : null}

        <span className="text-sm tabular-nums">
          {formatBdt(line.unitPrice)}
          {priceChanged ? (
            <span className="ml-2 text-xs text-(--color-muted)">
              was {formatBdt(line.addedPrice)}
            </span>
          ) : null}
        </span>

        {/* Problems are stated plainly rather than silently corrected — a
            quantity that changes by itself between cart and checkout is worse
            than one the customer was told about. */}
        {line.unavailable ? (
          <span className="text-xs text-(--color-danger)">
            No longer available — remove to continue
          </span>
        ) : overStock ? (
          <span className="text-xs text-(--color-danger)">
            Only {line.availableStock} left — reduce to continue
          </span>
        ) : null}

        <div className="mt-2 flex items-center gap-3">
          <div className="inline-flex items-center rounded-md border border-(--color-border)">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => changeQuantity(quantity - 1)}
              className="size-8 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= Math.min(MAX_LINE_QUANTITY, line.availableStock)}
              onClick={() => changeQuantity(quantity + 1)}
              className="size-8 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="text-xs text-(--color-muted) underline underline-offset-4 hover:text-(--color-danger) disabled:opacity-40"
          >
            Remove
          </button>
        </div>

        {error ? (
          <p role="alert" className="mt-1 text-xs text-(--color-danger)">
            {error}
          </p>
        ) : null}
      </div>

      <span className="text-sm font-medium tabular-nums">{formatBdt(line.lineTotal)}</span>
    </li>
  )
}
