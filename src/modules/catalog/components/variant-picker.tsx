'use client'

import { useMemo, useState } from 'react'

import { formatBdt } from '@/lib/money'
import { AddToCartButton } from '@/modules/cart/components/add-to-cart-button'

export type PickableVariant = {
  id: string
  title: string | null
  price: number
  compareAtPrice: number | null
  stock: number
  options: Record<string, string>
}

function optionValue(options: Record<string, string>, names: string[]) {
  for (const [key, value] of Object.entries(options)) {
    if (names.includes(key.trim().toLowerCase()) && value.trim()) return value.trim()
  }
  return ''
}

export function VariantPicker({
  variants,
  title,
  initialVariantId,
  directToCart = false,
}: {
  variants: PickableVariant[]
  title: string
  initialVariantId?: string
  directToCart?: boolean
}) {
  const requested = initialVariantId ? variants.find((variant) => variant.id === initialVariantId) : undefined
  const initial = requested ?? variants.find((v) => v.stock > 0) ?? variants[0]

  const colors = useMemo(
    () => [...new Set(variants.map((v) => optionValue(v.options, ['color', 'colour'])).filter(Boolean))],
    [variants],
  )
  const sizes = useMemo(
    () => [...new Set(variants.map((v) => optionValue(v.options, ['size'])).filter(Boolean))],
    [variants],
  )

  const [color, setColor] = useState(() => optionValue(initial?.options ?? {}, ['color', 'colour']))
  const [size, setSize] = useState(() => optionValue(initial?.options ?? {}, ['size']))

  const selected =
    variants.find((v) => {
      const variantColor = optionValue(v.options, ['color', 'colour'])
      const variantSize = optionValue(v.options, ['size'])
      const colorMatches = colors.length === 0 || variantColor === color
      const sizeMatches = sizes.length === 0 || variantSize === size
      return colorMatches && sizeMatches
    }) ?? initial

  if (!selected) return null

  const selectionComplete = (colors.length === 0 || Boolean(color)) && (sizes.length === 0 || Boolean(size))
  const discounted = selected.compareAtPrice != null && selected.compareAtPrice > selected.price

  function optionAvailable(type: 'color' | 'size', value: string) {
    return variants.some((variant) => {
      const variantColor = optionValue(variant.options, ['color', 'colour'])
      const variantSize = optionValue(variant.options, ['size'])
      const matches = type === 'color'
        ? variantColor === value && (sizes.length === 0 || !size || variantSize === size)
        : variantSize === value && (colors.length === 0 || !color || variantColor === color)
      return matches && variant.stock > 0
    })
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

      {colors.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Color</legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((value) => {
              const active = color === value
              const available = optionAvailable('color', value)
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  aria-pressed={active}
                  disabled={!available}
                  className={`min-h-11 rounded-md border px-4 text-sm font-medium transition-colors ${active ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-fg)' : 'border-(--color-border) hover:bg-(--color-surface)'} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      {sizes.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Size</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((value) => {
              const active = size === value
              const available = optionAvailable('size', value)
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSize(value)}
                  aria-pressed={active}
                  disabled={!available}
                  className={`min-h-11 min-w-11 rounded-md border px-4 text-sm font-medium transition-colors ${active ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-fg)' : 'border-(--color-border) hover:bg-(--color-surface)'} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      {colors.length === 0 && sizes.length === 0 && variants.length > 1 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Options</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  setColor(optionValue(variant.options, ['color', 'colour']))
                  setSize(optionValue(variant.options, ['size']))
                }}
                className="rounded-md border border-(--color-border) px-3 py-2 text-sm"
              >
                {variant.title || 'Standard'}
              </button>
            ))}
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

      <AddToCartButton
        variantId={selected.id}
        contentName={title}
        unitPrice={selected.price / 100}
        disabled={!selectionComplete || selected.stock === 0}
        className="w-full"
        redirectTo={directToCart ? '/cart' : undefined}
      >
        {selected.stock === 0 ? 'Sold out' : directToCart ? 'Buy now' : 'Add to cart'}
      </AddToCartButton>
    </div>
  )
}
