'use client'

import { useState } from 'react'

import { formatBdt } from '@/lib/money'
import { AddToCartButton } from '@/modules/cart/components/add-to-cart-button'

// Mirrors the server-enforced cart ceiling. Stock remains the tighter limit for
// most products; the server validates the submitted value authoritatively.
const MAX_LINE_QUANTITY = 99

export type PickableVariant = {
  id: string
  title: string | null
  price: number
  compareAtPrice: number | null
  stock: number
}

export function VariantPicker({
  variants,
  title,
}: {
  variants: PickableVariant[]
  title: string
}) {
  const [selectedId, setSelectedId] = useState(
    // Default to the first variant that can actually be bought.
    (variants.find((v) => v.stock > 0) ?? variants[0])?.id,
  )
  const [quantity, setQuantity] = useState(1)

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]
  if (!selected) return null

  const hasOptions = variants.length > 1
  const discounted = selected.compareAtPrice != null && selected.compareAtPrice > selected.price
  const maximumQuantity = Math.min(selected.stock, MAX_LINE_QUANTITY)

  function selectVariant(id: string) {
    setSelectedId(id)
    setQuantity(1)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold tabular-nums">{formatBdt(selected.price)}</span>
        {discounted ? (
          <>
            <span className="text-sm text-(--color-muted) line-through tabular-nums">
              {formatBdt(selected.compareAtPrice!)}
            </span>
            <span className="text-sm font-medium text-emerald-600">
              {Math.round((1 - selected.price / selected.compareAtPrice!) * 100)}% off
            </span>
          </>
        ) : null}
      </div>

      {hasOptions ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Options</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = variant.id === selected.id
              const soldOut = variant.stock === 0

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => selectVariant(variant.id)}
                  aria-pressed={isSelected}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-fg)'
                      : 'border-(--color-border) hover:bg-(--color-surface)'
                  } ${soldOut ? 'line-through opacity-50' : ''}`}
                >
                  {variant.title || 'Standard'}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      <p className="text-sm">
        {selected.stock === 0 ? (
          <span className="text-(--color-danger)">Sold out</span>
        ) : selected.stock <= 5 ? (
          <span className="text-amber-600">Only {selected.stock} left</span>
        ) : (
          <span className="text-(--color-muted)">In stock</span>
        )}
      </p>

      {selected.stock > 0 ? (
        <div className="flex items-center justify-between gap-4 border-t border-(--color-border) pt-5">
          <span className="text-sm font-medium">Quantity</span>
          <div
            className="flex h-11 items-center overflow-hidden rounded-md border border-(--color-border) bg-(--color-surface)"
            aria-label="Product quantity"
          >
            <button
              type="button"
              className="size-11 text-lg transition-colors hover:bg-(--color-bg) disabled:opacity-40"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <output className="w-10 text-center text-sm font-medium tabular-nums" aria-live="polite">
              {quantity}
            </output>
            <button
              type="button"
              className="size-11 text-lg transition-colors hover:bg-(--color-bg) disabled:opacity-40"
              onClick={() => setQuantity((current) => Math.min(maximumQuantity, current + 1))}
              disabled={quantity >= maximumQuantity}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <div>
        <AddToCartButton
          variantId={selected.id}
          contentName={title}
          unitPrice={selected.price / 100}
          quantity={quantity}
          disabled={selected.stock === 0}
          className="w-full"
        >
          {selected.stock === 0 ? 'Sold out' : 'Add to cart'}
        </AddToCartButton>
      </div>
    </div>
  )
}
