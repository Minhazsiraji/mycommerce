'use client'

import { useEffect, useRef, useState } from 'react'

import { formatBdt } from '@/lib/money'

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

  /**
   * On a phone the buy button scrolls out of sight while reading the
   * description, and the customer has to scroll back up to act. A bar pinned to
   * the bottom keeps price and action reachable — one of the few mobile
   * commerce patterns with a consistently measurable effect on conversion.
   *
   * It appears only once the inline button has actually left the viewport, so
   * it never covers content unnecessarily.
   */
  const inlineButtonRef = useRef<HTMLButtonElement>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    const target = inlineButtonRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry?.isIntersecting),
      { rootMargin: '0px 0px -8px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

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

      {/* Cart arrives in P2 — a disabled button is honest about that rather
          than pretending the store can take orders. */}
      <button
        ref={inlineButtonRef}
        type="button"
        disabled
        className="h-11 cursor-not-allowed rounded-md bg-(--color-accent) px-6 text-sm font-medium text-(--color-accent-fg) opacity-40"
      >
        Add to cart
      </button>
      <p className="-mt-3 text-xs text-(--color-muted)">Checkout opens soon.</p>

      {/* Mobile only — on a wide screen the buy button stays visible beside the
          gallery, so a pinned bar would be noise. */}
      <div
        aria-hidden={!showStickyBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-(--color-border) bg-(--color-bg)/95 backdrop-blur transition-transform duration-200 lg:hidden ${
          showStickyBar ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-(--color-muted)">{title}</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatBdt(selected.price)}
              {selected.stock === 0 ? (
                <span className="ml-2 text-xs font-normal text-(--color-danger)">Sold out</span>
              ) : null}
            </p>
          </div>

          <button
            type="button"
            disabled
            // Not focusable while hidden, or keyboard users would tab into an
            // off-screen control.
            tabIndex={showStickyBar ? 0 : -1}
            className="h-11 shrink-0 cursor-not-allowed rounded-md bg-(--color-accent) px-6 text-sm font-medium text-(--color-accent-fg) opacity-40"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}
