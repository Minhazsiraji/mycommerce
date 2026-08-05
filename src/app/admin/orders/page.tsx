import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'

import { formatBdt } from '@/lib/money'
import { listOrdersForAdmin, orderFiltersSchema } from '@/modules/orders'

export const metadata: Metadata = { title: 'Orders' }

const PAYMENT_STYLES: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-500',
  awaiting_verification: 'bg-amber-500/15 text-amber-600',
  awaiting_transfer: 'bg-amber-500/15 text-amber-600',
  unpaid: 'bg-neutral-500/15 text-(--color-muted)',
  failed: 'bg-red-500/15 text-red-500',
  refunded: 'bg-neutral-500/15 text-(--color-muted)',
}

const label = (s: string) => s.replace(/_/g, ' ')

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  await connection()

  const filters = orderFiltersSchema.parse(await searchParams)
  const { rows, total, pageSize } = await listOrdersForAdmin(filters)
  const lastPage = Math.max(1, Math.ceil(total / pageSize))

  const pageHref = (page: number) => ({
    pathname: '/admin/orders' as const,
    query: {
      ...(filters.q ? { q: filters.q } : {}),
      ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
      ...(filters.fulfillmentStatus ? { fulfillmentStatus: filters.fulfillmentStatus } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-(--color-muted)">
          {total} {total === 1 ? 'order' : 'orders'}
        </p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={filters.q ?? ''}
          placeholder="Order number or email…"
          aria-label="Search orders"
          className="h-10 min-w-56 flex-1 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm"
        />
        <select
          name="paymentStatus"
          defaultValue={filters.paymentStatus ?? ''}
          aria-label="Filter by payment status"
          className="h-10 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm"
        >
          <option value="">Any payment</option>
          {['unpaid', 'awaiting_transfer', 'awaiting_verification', 'paid', 'failed', 'refunded'].map(
            (s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ),
          )}
        </select>
        <select
          name="fulfillmentStatus"
          defaultValue={filters.fulfillmentStatus ?? ''}
          aria-label="Filter by fulfilment"
          className="h-10 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm"
        >
          <option value="">Any fulfilment</option>
          {['unfulfilled', 'processing', 'shipped', 'delivered'].map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-md border border-(--color-border) px-4 text-sm hover:bg-(--color-surface)"
        >
          Apply
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--color-border) px-6 py-16 text-center text-sm text-(--color-muted)">
          No orders match.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-(--color-border)">
          <table className="w-full min-w-3xl text-sm">
            <thead className="bg-(--color-surface) text-left text-(--color-muted)">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Fulfilment</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-t border-(--color-border)">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium tabular-nums underline-offset-4 hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                    <span className="block text-xs text-(--color-muted)">
                      {o.createdAt.toLocaleDateString('en-GB')} · {label(o.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">{o.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STYLES[o.paymentStatus] ?? ''}`}
                    >
                      {label(o.paymentStatus)}
                    </span>
                    {o.status === 'cancelled' ? (
                      <span className="ml-2 text-xs text-(--color-danger)">cancelled</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">{label(o.fulfillmentStatus)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatBdt(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lastPage > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-(--color-muted)">
            Page {filters.page} of {lastPage}
          </span>
          <div className="flex gap-2">
            {filters.page > 1 ? (
              <Link
                href={pageHref(filters.page - 1)}
                className="rounded-md border border-(--color-border) px-3 py-1.5 hover:bg-(--color-surface)"
              >
                Previous
              </Link>
            ) : null}
            {filters.page < lastPage ? (
              <Link
                href={pageHref(filters.page + 1)}
                className="rounded-md border border-(--color-border) px-3 py-1.5 hover:bg-(--color-surface)"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
