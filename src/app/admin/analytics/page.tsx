import type { Metadata } from 'next'
import { connection } from 'next/server'

import { formatBdt } from '@/lib/money'
import { analyticsFiltersSchema, getAnalytics } from '@/modules/analytics'

export const metadata: Metadata = { title: 'Analytics' }

const PRESETS = [
  ['today', 'Today'],
  ['7d', 'Last 7 days'],
  ['30d', 'Last 30 days'],
  ['90d', 'Last 90 days'],
  ['month', 'This month'],
  ['year', 'This year'],
  ['all', 'All time'],
  ['custom', 'Custom dates'],
] as const

function percentChange(current: number, previous: number | undefined) {
  if (previous === undefined) return null
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

function Change({ current, previous }: { current: number; previous?: number }) {
  const change = percentChange(current, previous)
  if (change === null) return null
  const positive = change >= 0
  return (
    <span className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
      {positive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs previous period
    </span>
  )
}

function Kpi({ label, value, detail, change }: { label: string; value: string; detail?: string; change?: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-(--color-border) bg-(--surface-primary) p-5 shadow-(--shadow-1) backdrop-blur-md">
      <p className="text-sm text-(--color-muted)">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {detail ? <p className="mt-1 text-xs text-(--color-muted)">{detail}</p> : null}
      {change ? <div className="mt-2">{change}</div> : null}
    </article>
  )
}

const readable = (value: string) => value.replaceAll('_', ' ')

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await connection()
  const raw = await searchParams
  const filters = analyticsFiltersSchema.parse(raw)
  const data = await getAnalytics(filters)
  const maxTrend = Math.max(1, ...data.trend.map((item) => item.sales))
  const maxProduct = Math.max(1, ...data.products.map((item) => item.sales))
  const exportQuery = new URLSearchParams(
    Object.entries(raw).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ).toString()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales analytics</h1>
          <p className="mt-1 text-sm text-(--color-muted)">
            Paid, non-cancelled sales · grouped in Bangladesh time
          </p>
        </div>
        <a
          href={`/admin/analytics/export${exportQuery ? `?${exportQuery}` : ''}`}
          className="inline-flex h-10 items-center rounded-md border border-(--color-border) bg-(--surface-primary) px-4 text-sm font-medium hover:bg-(--color-surface)"
        >
          Download CSV
        </a>
      </div>

      <form method="get" className="grid gap-3 rounded-xl border border-(--color-border) bg-(--surface-primary) p-4 shadow-(--shadow-1) sm:grid-cols-2 lg:grid-cols-6">
        <label className="text-xs font-medium text-(--color-muted)">
          Period
          <select name="preset" defaultValue={filters.preset} className="mt-1 h-10 w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-fg)">
            {PRESETS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-(--color-muted)">
          From
          <input type="date" name="from" defaultValue={filters.from} className="mt-1 h-10 w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-fg)" />
        </label>
        <label className="text-xs font-medium text-(--color-muted)">
          To
          <input type="date" name="to" defaultValue={filters.to} className="mt-1 h-10 w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-fg)" />
        </label>
        <label className="text-xs font-medium text-(--color-muted)">
          Category
          <select name="categoryId" defaultValue={filters.categoryId ?? ''} className="mt-1 h-10 w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-fg)">
            <option value="">All categories</option>
            {data.categoryOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-(--color-muted)">
          Product
          <select name="productId" defaultValue={filters.productId ?? ''} className="mt-1 h-10 w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-fg)">
            <option value="">All products</option>
            {data.productOptions.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="h-10 w-full rounded-md bg-(--color-accent) px-4 text-sm font-medium text-(--color-accent-fg) hover:opacity-90">Apply filters</button>
        </div>
        <label className="text-xs font-medium text-(--color-muted)">
          Chart grouping
          <select name="group" defaultValue={filters.group} className="mt-1 h-10 w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-fg)">
            <option value="auto">Automatic</option>
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </label>
      </form>

      <section aria-label="Key performance indicators" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Collected sales" value={formatBdt(data.current.sales)} detail={`${data.current.salesOrders} paid orders`} change={<Change current={data.current.sales} previous={data.previous?.sales} />} />
        <Kpi label="Units sold" value={data.units.toLocaleString('en-BD')} detail="Paid, non-cancelled items" change={<Change current={data.units} previous={data.previous?.units} />} />
        <Kpi label="Average order value" value={formatBdt(data.current.averageOrderValue)} change={<Change current={data.current.averageOrderValue} previous={data.previous?.averageOrderValue} />} />
        <Kpi label="Customers" value={data.current.uniqueCustomers.toLocaleString('en-BD')} detail={`${data.current.repeatCustomers} repeat in this period`} />
        <Kpi label="Orders placed" value={data.current.orders.toLocaleString('en-BD')} detail={`${data.current.pending} awaiting payment`} change={<Change current={data.current.orders} previous={data.previous?.orders} />} />
        <Kpi label={filters.categoryId || filters.productId ? 'Filtered item sales' : 'Merchandise sales'} value={formatBdt(data.current.itemSales)} detail={`Shipping collected ${formatBdt(data.current.shipping)}`} />
        <Kpi label="Cancelled orders" value={data.current.cancelled.toLocaleString('en-BD')} detail={data.current.orders ? `${((data.current.cancelled / data.current.orders) * 100).toFixed(1)}% of placed orders` : 'No orders'} />
        <Kpi label="Refunded orders" value={data.current.refunded.toLocaleString('en-BD')} detail={`Discounts ${formatBdt(data.current.discount)}`} />
      </section>

      <section className="rounded-xl border border-(--color-border) bg-(--surface-primary) p-5 shadow-(--shadow-1)">
        <div className="flex items-baseline justify-between gap-4">
          <div><h2 className="font-semibold">Sales trend</h2><p className="text-xs text-(--color-muted)">{data.range.group} totals</p></div>
          <p className="text-sm font-medium tabular-nums">{formatBdt(data.current.sales)}</p>
        </div>
        {data.trend.length ? (
          <div className="mt-6 flex h-64 items-end gap-2 overflow-x-auto border-b border-(--color-border) pb-7" role="img" aria-label={`Sales trend with ${data.trend.length} ${data.range.group} periods`}>
            {data.trend.map((item) => (
              <div key={item.period} className="group relative flex h-full min-w-9 flex-1 items-end justify-center" title={`${item.period}: ${formatBdt(item.sales)}, ${item.orders} orders`}>
                <div className="w-full max-w-14 rounded-t bg-(--color-accent) opacity-80 transition-opacity group-hover:opacity-100" style={{ height: `${Math.max(2, (item.sales / maxTrend) * 100)}%` }} />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-(--color-muted)">{item.period}</span>
              </div>
            ))}
          </div>
        ) : <p className="mt-6 rounded-lg border border-dashed border-(--color-border) py-14 text-center text-sm text-(--color-muted)">No paid sales in this period.</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-(--color-border) bg-(--surface-primary) p-5 shadow-(--shadow-1)">
          <h2 className="font-semibold">Product performance</h2>
          <p className="text-xs text-(--color-muted)">Top 20 by merchandise sales</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-lg text-sm">
              <thead className="text-left text-xs text-(--color-muted)"><tr><th className="pb-3 font-medium">Product</th><th className="pb-3 text-right font-medium">Qty</th><th className="pb-3 text-right font-medium">Sales</th></tr></thead>
              <tbody>{data.products.map((item) => <tr key={`${item.productId}-${item.product}`} className="border-t border-(--color-border)"><td className="py-3 pr-3"><span className="line-clamp-1 font-medium">{item.product}</span><span className="mt-1 block h-1.5 rounded-full bg-(--color-surface)"><span className="block h-full rounded-full bg-(--color-accent)" style={{ width: `${Math.max(2, (item.sales / maxProduct) * 100)}%` }} /></span></td><td className="py-3 text-right tabular-nums">{item.units}</td><td className="py-3 text-right font-medium tabular-nums">{formatBdt(item.sales)}</td></tr>)}</tbody>
            </table>
            {!data.products.length ? <p className="py-10 text-center text-sm text-(--color-muted)">No product sales.</p> : null}
          </div>
        </section>

        <section className="rounded-xl border border-(--color-border) bg-(--surface-primary) p-5 shadow-(--shadow-1)">
          <h2 className="font-semibold">Category performance</h2>
          <p className="text-xs text-(--color-muted)">Contribution to merchandise sales</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-md text-sm"><thead className="text-left text-xs text-(--color-muted)"><tr><th className="pb-3 font-medium">Category</th><th className="pb-3 text-right font-medium">Qty</th><th className="pb-3 text-right font-medium">Sales</th><th className="pb-3 text-right font-medium">Share</th></tr></thead><tbody>{data.categories.map((item) => <tr key={`${item.categoryId}-${item.category}`} className="border-t border-(--color-border)"><td className="py-3 font-medium">{item.category}</td><td className="py-3 text-right tabular-nums">{item.units}</td><td className="py-3 text-right tabular-nums">{formatBdt(item.sales)}</td><td className="py-3 text-right tabular-nums">{data.current.itemSales ? `${((item.sales / data.current.itemSales) * 100).toFixed(1)}%` : '0%'}</td></tr>)}</tbody></table>
            {!data.categories.length ? <p className="py-10 text-center text-sm text-(--color-muted)">No category sales.</p> : null}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-(--color-border) bg-(--surface-primary) p-5 shadow-(--shadow-1)">
        <h2 className="font-semibold">Payment health</h2>
        <p className="text-xs text-(--color-muted)">All payment outcomes in the selected period</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-xl text-sm"><thead className="text-left text-xs text-(--color-muted)"><tr><th className="pb-3 font-medium">Method</th><th className="pb-3 font-medium">Status</th><th className="pb-3 text-right font-medium">Orders</th><th className="pb-3 text-right font-medium">Order value</th></tr></thead><tbody>{data.payments.map((item) => <tr key={`${item.method}-${item.status}`} className="border-t border-(--color-border)"><td className="py-3">{readable(item.method)}</td><td className="py-3">{readable(item.status)}</td><td className="py-3 text-right tabular-nums">{item.orders}</td><td className="py-3 text-right tabular-nums">{formatBdt(item.value)}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  )
}
