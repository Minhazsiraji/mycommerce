import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'

import { storage } from '@/lib/storage'
import { readCart } from '@/modules/cart'
import { CartContents } from '@/modules/cart/components/cart-contents'
import { deliveryEstimate, lowestFreeThreshold } from '@/modules/shipping'

export const metadata: Metadata = { title: 'Your cart' }

export default async function CartPage() {
  /**
   * Declares this page per-request before anything else runs. The cart is never
   * cacheable, and without this Next attempts to prerender it and then fails
   * when the auth stack reaches for crypto during that prerender.
   */
  await connection()

  const [cart, freeDeliveryOver, deliveryDays] = await Promise.all([
    readCart(),
    lowestFreeThreshold(),
    deliveryEstimate(),
  ])

  if (cart.lines.length === 0) {
    return (
      <div className="storefront-card flex flex-col items-center gap-4 px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="text-(--color-muted)">Nothing added yet.</p>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-md bg-(--color-accent) px-6 text-sm font-medium text-(--color-accent-fg) hover:opacity-90"
        >
          Browse products
        </Link>
      </div>
    )
  }

  // Image URLs are built here so the client component stays vendor-agnostic.
  const lines = cart.lines.map((line) => ({
    ...line,
    imageUrl: line.imageKey
      ? storage.url(line.imageKey, { width: 160, height: 160, fit: 'cover' })
      : null,
  }))

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>

      {/* Lines and summary share one optimistic state, so quantity, line total,
          subtotal and the free-delivery bar all move on the same click. */}
      <CartContents
        lines={lines}
        freeDeliveryOver={freeDeliveryOver}
        deliveryDays={deliveryDays}
      />
    </div>
  )
}
