import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'

import { env } from '@/lib/env'
import { formatBdt } from '@/lib/money'
import { getVisibleOrder } from '@/modules/orders'
import { BankTransferInstructions } from '@/modules/payments/components/bank-transfer-instructions'
import { PayNowButton } from '@/modules/payments/components/pay-now-button'

export const metadata: Metadata = { title: 'Your order', robots: { index: false } }

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  awaiting_transfer: {
    title: 'Order placed — awaiting your transfer',
    body: 'Send the amount below, then submit your transaction reference. We confirm within one working day.',
  },
  awaiting_verification: {
    title: 'Reference received',
    body: 'We are checking your transfer against our bank statement. You will get an email once it clears.',
  },
  unpaid: {
    title: 'Order placed — payment pending',
    body: 'Complete payment to confirm your order. Your items are held for 30 minutes.',
  },
  paid: {
    title: 'Order confirmed',
    body: 'Payment received. We will email you when it ships.',
  },
  failed: {
    title: 'Payment did not go through',
    body: 'Nothing was charged. You can try paying again below.',
  },
  refunded: {
    title: 'Order refunded',
    body: 'The payment has been returned to you.',
  },
}

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  await connection()

  const { orderNumber } = await params
  const order = await getVisibleOrder(orderNumber)

  /**
   * Send anyone who cannot see this to the lookup form, prefilled.
   *
   * The viewing cookie only lasts a week, so the commonest visitor here is a
   * guest coming back to an old confirmation email — a 404 would strand them.
   * Redirecting unconditionally also keeps this from being an oracle: a missing
   * order and someone else's order produce exactly the same response.
   */
  if (!order) redirect(`/orders/lookup?order=${encodeURIComponent(orderNumber)}`)

  const copy = STATUS_COPY[order.paymentStatus] ?? STATUS_COPY.unpaid!
  const address = order.shippingAddress

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="text-(--color-muted)">{copy.body}</p>
        <p className="text-sm">
          Order <span className="font-medium tabular-nums">{order.orderNumber}</span>
        </p>
      </div>

      {order.status === 'cancelled' ? (
        <p className="rounded-lg bg-(--color-danger)/10 px-4 py-3 text-sm text-(--color-danger)">
          This order was cancelled because payment was not completed in time. Nothing was charged.
        </p>
      ) : order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'awaiting_transfer' ? (
        <BankTransferInstructions
          orderNumber={order.orderNumber}
          amount={order.total}
          bank={{
            accountName: env.BANK_ACCOUNT_NAME ?? null,
            accountNumber: env.BANK_ACCOUNT_NUMBER ?? null,
            bankName: env.BANK_NAME ?? null,
            branch: env.BANK_BRANCH ?? null,
          }}
        />
      ) : order.paymentMethod === 'sslcommerz' &&
        (order.paymentStatus === 'unpaid' || order.paymentStatus === 'failed') ? (
        <PayNowButton orderNumber={order.orderNumber} amount={order.total} />
      ) : null}

      <section className="storefront-card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">Items</h2>

        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span className="min-w-0">
                {item.productTitle}
                {item.variantTitle ? ` · ${item.variantTitle}` : ''}
                <span className="text-(--color-muted)"> × {item.quantity}</span>
              </span>
              <span className="shrink-0 tabular-nums">{formatBdt(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-1 border-t border-(--color-border) pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-(--color-muted)">Subtotal</dt>
            <dd className="tabular-nums">{formatBdt(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-(--color-muted)">Delivery</dt>
            <dd className="tabular-nums">
              {order.shippingCost === 0 ? 'Free' : formatBdt(order.shippingCost)}
            </dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatBdt(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="storefront-card flex flex-col gap-2 p-5 text-sm">
        <h2 className="text-sm font-semibold">Delivering to</h2>
        <address className="text-(--color-muted) not-italic">
          {address.recipient}
          <br />
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}
          <br />
          {address.city}, {address.district}
          {address.postalCode ? ` ${address.postalCode}` : ''}
          <br />
          {address.phone}
        </address>
      </section>

      <Link href="/" className="text-sm underline underline-offset-4">
        ← Continue shopping
      </Link>
    </div>
  )
}
