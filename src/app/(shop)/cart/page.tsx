import type { Metadata } from 'next'
import Link from 'next/link'

import { formatBdt } from '@/lib/money'
import { storage } from '@/lib/storage'
import { readCart } from '@/modules/cart'
import { CartLines } from '@/modules/cart/components/cart-lines'

export const metadata: Metadata = { title: 'Your cart' }

export default async function CartPage() {
  const cart = await readCart()

  if (cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
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

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <CartLines lines={lines} />

        <aside className="flex h-fit flex-col gap-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
          <h2 className="text-sm font-semibold">Summary</h2>

          <div className="flex justify-between text-sm">
            <span className="text-(--color-muted)">
              Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
            </span>
            <span className="font-medium tabular-nums">{formatBdt(cart.subtotal)}</span>
          </div>

          <p className="text-xs text-(--color-muted)">
            Delivery is calculated at checkout.
          </p>

          {cart.hasIssues ? (
            <p className="rounded-md bg-(--color-danger)/10 px-3 py-2 text-xs text-(--color-danger)">
              Some items changed. Review them before continuing.
            </p>
          ) : null}

          <Link
            href="/checkout"
            aria-disabled={cart.hasIssues}
            className={`inline-flex h-11 items-center justify-center rounded-md bg-(--color-accent) px-6 text-sm font-medium text-(--color-accent-fg) hover:opacity-90 ${
              cart.hasIssues ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  )
}
