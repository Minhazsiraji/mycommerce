import { CartBadgeClient } from './cart-badge-client'
import { readCart } from '../service'

/**
 * Per-visitor, so it must never be baked into the cached layout. Rendered
 * inside a Suspense boundary in the shop header: the rest of the header stays
 * static and this streams in.
 *
 * The server supplies the authoritative initial count. Product-page Add to Cart
 * then increments the small client badge after the server write succeeds,
 * avoiding a full route refresh just to update this number.
 */
export async function CartBadge() {
  const cart = await readCart()
  return <CartBadgeClient initialCount={cart.itemCount} />
}

/** Identical footprint, so the header does not shift when the real badge lands. */
export function CartBadgeFallback() {
  return (
    <span
      className="inline-flex size-11 shrink-0 items-center justify-center text-(--text-secondary)"
      aria-hidden="true"
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
    </span>
  )
}
