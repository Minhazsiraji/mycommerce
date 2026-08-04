import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { formatBdt } from '@/lib/money'
import { readCart } from '@/modules/cart'

export const metadata: Metadata = { title: 'Checkout' }

/**
 * Placeholder. Delivery details, shipping rates and payment land in the next
 * step of P2; this exists so the cart's checkout button is not a dead link and
 * so the order summary it will build on is already correct.
 */
export default async function CheckoutPage() {
  const cart = await readCart()

  if (cart.lines.length === 0) redirect('/cart')

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>

      <div className="flex flex-col gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
        <h2 className="text-sm font-semibold">Order summary</h2>

        <ul className="flex flex-col gap-2 text-sm">
          {cart.lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-4">
              <span className="min-w-0 truncate">
                {line.productTitle}
                {line.variantTitle ? ` · ${line.variantTitle}` : ''}
                <span className="text-(--color-muted)"> × {line.quantity}</span>
              </span>
              <span className="shrink-0 tabular-nums">{formatBdt(line.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t border-(--color-border) pt-3 text-sm font-medium">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBdt(cart.subtotal)}</span>
        </div>
      </div>

      <p className="rounded-lg border border-dashed border-(--color-border) px-5 py-8 text-center text-sm text-(--color-muted)">
        Delivery details and payment are being built. Your cart is saved.
      </p>

      <Link href="/cart" className="text-sm underline underline-offset-4">
        ← Back to cart
      </Link>
    </div>
  )
}
