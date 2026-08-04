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

type Change = { id: string; quantity: number }

/**
 * Lines and summary in one component, deliberately.
 *
 * They were split, with the summary server-rendered. The quantity then updated
 * instantly while the line total and subtotal waited on a round trip — the
 * numbers visibly disagreed for a moment, which reads as broken rather than
 * fast. Sharing one optimistic state means every figure moves together.
 */
export function CartContents({
  lines: serverLines,
  freeDeliveryOver,
  deliveryDays,
}: {
  lines: CartLineView[]
  /** Lowest free-delivery threshold on offer, or null if the store has none. */
  freeDeliveryOver: number | null
  deliveryDays: { min: number; max: number } | null
}) {
  const [lines, applyChange] = useOptimistic(serverLines, (current, change: Change) =>
    current
      .map((line) =>
        line.id === change.id
          ? { ...line, quantity: change.quantity, lineTotal: line.unitPrice * change.quantity }
          : line,
      )
      // Quantity zero is a removal, so the row leaves immediately.
      .filter((line) => line.quantity > 0),
  )

  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0)
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0)
  const hasIssues = lines.some(
    (line) => line.unavailable || line.availableStock < line.quantity,
  )

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="flex flex-col divide-y divide-(--color-border) border-y border-(--color-border)">
        {lines.map((line) => (
          <CartLineRow key={line.id} line={line} applyChange={applyChange} />
        ))}
      </ul>

      <aside className="flex h-fit flex-col gap-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-5 lg:sticky lg:top-6">
        <h2 className="text-sm font-semibold">Summary</h2>

        <div className="flex justify-between text-sm">
          <span className="text-(--color-muted)">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium tabular-nums">{formatBdt(subtotal)}</span>
        </div>

        {/*
          Driven by the same optimistic subtotal as everything else, so the bar
          moves on the click rather than after a round trip.

          The cart does not know the destination yet, so this shows the lowest
          threshold on offer — promising the easiest one and then charging more
          at checkout would be worse than saying nothing.
        */}
        {freeDeliveryOver !== null ? (
          subtotal >= freeDeliveryOver ? (
            <p className="rounded-md bg-(--color-success)/10 px-3 py-2 text-xs font-medium text-(--color-success)">
              Free delivery unlocked
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-(--color-muted)">
                Add{' '}
                <span className="font-medium text-(--color-fg)">
                  {formatBdt(freeDeliveryOver - subtotal)}
                </span>{' '}
                more for free delivery
              </p>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-(--color-bg)"
                role="progressbar"
                aria-valuenow={Math.min(100, Math.round((subtotal / freeDeliveryOver) * 100))}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress towards free delivery"
              >
                <div
                  className="h-full rounded-full bg-(--color-accent) transition-[width] duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeDeliveryOver) * 100)}%` }}
                />
              </div>
            </div>
          )
        ) : null}

        <p className="text-xs text-(--color-muted)">
          {deliveryDays
            ? `Delivery in ${deliveryDays.min}–${deliveryDays.max} days. Charge calculated at checkout.`
            : 'Delivery is calculated at checkout.'}
        </p>

        {hasIssues ? (
          <p className="rounded-md bg-(--color-danger)/10 px-3 py-2 text-xs text-(--color-danger)">
            Some items changed. Review them before continuing.
          </p>
        ) : null}

        <Link
          href="/checkout"
          aria-disabled={hasIssues}
          className={`inline-flex h-11 items-center justify-center rounded-md bg-(--color-accent) px-6 text-sm font-medium text-(--color-accent-fg) hover:opacity-90 ${
            hasIssues ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          Checkout
        </Link>
      </aside>
    </div>
  )
}

function CartLineRow({
  line,
  applyChange,
}: {
  line: CartLineView
  applyChange: (change: Change) => void
}) {
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string>()

  function change(quantity: number) {
    setError(undefined)

    startTransition(async () => {
      applyChange({ id: line.id, quantity })

      const result =
        quantity === 0
          ? await removeLine({ lineId: line.id })
          : await updateLineQuantity({ lineId: line.id, quantity })

      // React discards the optimistic value when the transition ends, so a
      // failure reverts on its own — the message just explains why.
      if (!result.ok) setError(result.error.message)
    })
  }

  const priceChanged = line.unitPrice !== line.addedPrice
  const overStock = !line.unavailable && line.availableStock < line.quantity
  const atMax = line.quantity >= Math.min(MAX_LINE_QUANTITY, line.availableStock)

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

        {/* Stated plainly rather than silently corrected — a quantity that
            changes by itself between cart and checkout is worse than one the
            customer was told about. */}
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
              onClick={() => change(line.quantity - 1)}
              className="size-8 text-base leading-none hover:bg-(--color-surface)"
            >
              −
            </button>
            <span className="w-8 text-center text-sm tabular-nums">{line.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={atMax}
              onClick={() => change(line.quantity + 1)}
              className="size-8 text-base leading-none hover:bg-(--color-surface) disabled:opacity-40 disabled:hover:bg-transparent"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => change(0)}
            className="text-xs text-(--color-muted) underline underline-offset-4 hover:text-(--color-danger)"
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
