import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'

import { formatBdt } from '@/lib/money'
import { listMyOrders } from '@/modules/orders'

export const metadata: Metadata = { title: 'Your orders' }

const label = (s: string) => s.replace(/_/g, ' ')

const STATUS_COPY: Record<string, string> = {
  awaiting_transfer: 'Awaiting your transfer',
  awaiting_verification: 'Checking your transfer',
  unpaid: 'Payment pending',
  paid: 'Confirmed',
  failed: 'Payment failed',
  refunded: 'Refunded',
}

export default async function AccountOrdersPage() {
  await connection()

  const orders = await listMyOrders()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <Link href="/account" className="text-sm text-(--color-muted) underline underline-offset-4">
          ← Account
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Your orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-(--color-border) px-6 py-16 text-center">
          <p className="font-medium">No orders yet</p>
          <Link href="/" className="mt-2 inline-block text-sm underline underline-offset-4">
            Browse the store
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-(--color-border) border-y border-(--color-border)">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                <Link
                  href={`/orders/${order.orderNumber}`}
                  className="text-sm font-medium tabular-nums underline-offset-4 hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <span className="text-xs text-(--color-muted)">
                  {order.createdAt.toLocaleDateString('en-GB')} ·{' '}
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                  {order.status === 'cancelled'
                    ? 'Cancelled'
                    : (STATUS_COPY[order.paymentStatus] ?? label(order.paymentStatus))}
                </span>
              </div>
              <span className="shrink-0 text-sm tabular-nums">{formatBdt(order.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
