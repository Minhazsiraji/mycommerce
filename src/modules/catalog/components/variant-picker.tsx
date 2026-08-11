'use client'

import { useState } from 'react'

import { formatBdt } from '@/lib/money'
import { AddToCartButton } from '@/modules/cart/components/add-to-cart-button'

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

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]
  if (!selected) return null

  const hasOptions = variants.length > 1
  const discounted = selected.compareAtPrice != null && selected.compareAtPrice > selected.price

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
                  onClick={() => setSelectedId(variant.id)}
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

      <div>
        <AddToCartButton
          variantId={selected.id}
          contentName={title}
          unitPrice={selected.price / 100}
          disabled={selected.stock === 0}
          className="w-full"
        >
          {selected.stock === 0 ? 'Sold out' : 'Add to cart'}
        </AddToCartButton>
      </div>
    </div>
  )
}
