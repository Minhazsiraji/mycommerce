import Link from 'next/link'

import { readCart } from '../service'

/**
 * Per-visitor, so it must never be baked into the cached layout. Rendered
 * inside a Suspense boundary in the shop header: the rest of the header stays
 * static and this streams in.
 */
export async function CartBadge() {
  const cart = await readCart()

  return (
    <Link
      href="/cart"
      className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-(--radius-md) text-(--text-secondary) transition-colors hover:bg-(--surface-secondary) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
      aria-label={
        cart.itemCount === 0
          ? 'Cart, empty'
          : `Cart, ${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}`
      }
    >
      <CartIcon />

      {/*
        Overlaid on the icon rather than sitting beside it. A count in the flow
        makes the header jump sideways as it changes width, and reads as a
        separate control; the corner overlay is the pattern people already
        recognise from every other store.
      */}
      {cart.itemCount > 0 ? (
        <span className="absolute top-0 right-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-(--action-primary) px-1 text-[10px] leading-none font-semibold text-(--action-primary-text) tabular-nums">
          {cart.itemCount > 99 ? '99+' : cart.itemCount}
        </span>
      ) : null}
    </Link>
  )
}

/** Identical footprint, so the header does not shift when the real badge lands. */
export function CartBadgeFallback() {
  return (
    <span
      className="inline-flex size-11 shrink-0 items-center justify-center text-(--text-secondary)"
      aria-hidden="true"
    >
      <CartIcon />
    </span>
  )
}

function CartIcon() {
  return (
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
  )
}
