'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export const CART_INCREMENT_EVENT = 'mycommerce:cart-increment'

export function CartBadgeClient({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  useEffect(() => {
    function onIncrement(event: Event) {
      const quantity = event instanceof CustomEvent && typeof event.detail === 'number' ? event.detail : 1
      setCount((current) => Math.min(99, current + quantity))
    }

    window.addEventListener(CART_INCREMENT_EVENT, onIncrement)
    return () => window.removeEventListener(CART_INCREMENT_EVENT, onIncrement)
  }, [])

  return (
    <Link
      href="/cart"
      className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-(--radius-md) text-(--text-secondary) transition-colors hover:bg-(--surface-secondary) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
      aria-label={count === 0 ? 'Cart, empty' : `Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M2 3h2.5l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H5.2" />
      </svg>

      {count > 0 ? (
        <span className="absolute top-0 right-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-(--action-primary) px-1 text-[10px] leading-none font-semibold text-(--action-primary-text) tabular-nums">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  )
}
