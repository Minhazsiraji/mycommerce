import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'

import { getSession, listAddresses } from '@/modules/accounts'
import { readCart } from '@/modules/cart'
import { CheckoutForm } from '@/modules/orders/components/checkout-form'
import { listActiveRates } from '@/modules/shipping'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  // Per-request for the same reason as the cart — see the note there.
  await connection()

  const [cart, session, rates] = await Promise.all([readCart(), getSession(), listActiveRates()])

  if (cart.lines.length === 0) redirect('/cart')

  // Refuse rather than silently adjusting; the customer fixes it in the cart.
  if (cart.hasIssues) redirect('/cart')

  const saved = session ? await listAddresses(session.user.id) : []
  const preferred = saved.find((a) => a.isDefault) ?? saved[0]

  if (rates.length === 0) {
    return (
      <div className="storefront-card mx-auto flex max-w-lg flex-col gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout is unavailable</h1>
        <p className="text-(--color-muted)">
          No delivery options are configured yet, so orders cannot be taken. Please try again
          shortly.
        </p>
        <Link href="/cart" className="text-sm underline underline-offset-4">
          ← Back to cart
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>

      <CheckoutForm
        subtotal={cart.subtotal}
        signedIn={Boolean(session)}
        rates={rates.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          cost: r.cost,
          freeOverSubtotal: r.freeOverSubtotal,
          districts: r.districts,
          estimatedDaysMin: r.estimatedDaysMin,
          estimatedDaysMax: r.estimatedDaysMax,
        }))}
        defaults={{
          email: session?.user.email ?? '',
          recipient: preferred?.recipient ?? session?.user.name ?? '',
          phone: preferred?.phone ?? '',
          line1: preferred?.line1 ?? '',
          line2: preferred?.line2 ?? '',
          city: preferred?.city ?? '',
          district: preferred?.district ?? '',
          upazila: preferred?.upazila ?? '',
          union: preferred?.union ?? '',
          postalCode: preferred?.postalCode ?? '',
        }}
      />
    </div>
  )
}
