import Link from 'next/link'

import { readCart } from '../service'

/**
 * Per-visitor, so it must never be part of a cached layout. Rendered inside a
 * Suspense boundary in the shop header: the rest of the header stays static and
 * this streams in.
 */
export async function CartBadge() {
  const cart = await readCart()

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm text-(--color-muted) hover:text-(--color-fg)"
      aria-label={
        cart.itemCount === 0
          ? 'Cart, empty'
          : `Cart, ${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}`
      }
    >
      <CartIcon />
      {cart.itemCount > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-(--color-accent) px-1.5 text-xs font-medium text-(--color-accent-fg) tabular-nums">
          {cart.itemCount}
        </span>
      ) : null}
    </Link>
  )
}

/** Same footprint as the real badge, so the header does not shift when it lands. */
export function CartBadgeFallback() {
  return (
    <span className="inline-flex h-9 items-center px-2 text-(--color-muted)" aria-hidden="true">
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
      strokeWidth="2"
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
