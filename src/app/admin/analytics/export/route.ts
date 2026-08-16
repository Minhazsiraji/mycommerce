import { analyticsFiltersSchema, csvRow, getAnalytics } from '@/modules/analytics'
import { requireRole } from '@/modules/accounts'

export async function GET(request: Request) {
  await requireRole('admin')
  const url = new URL(request.url)
  const filters = analyticsFiltersSchema.parse(Object.fromEntries(url.searchParams))
  const data = await getAnalytics(filters)
  const lines = [
    csvRow(['SirajiBD sales analytics']),
    csvRow(['Period', filters.preset]),
    csvRow(['Paid sales (BDT)', (data.current.sales / 100).toFixed(2)]),
    csvRow(['Paid orders', data.current.salesOrders]),
    csvRow(['Units sold', data.units]),
    csvRow(['Average order value (BDT)', (data.current.averageOrderValue / 100).toFixed(2)]),
    csvRow(['Unique customers', data.current.uniqueCustomers]),
    csvRow(['Cancelled orders', data.current.cancelled]),
    csvRow(['Refunded orders', data.current.refunded]),
    '',
    csvRow(['Trend']),
    csvRow(['Period', 'Orders', 'Sales (BDT)']),
    ...data.trend.map((item) => csvRow([item.period, item.orders, (item.sales / 100).toFixed(2)])),
    '',
    csvRow(['Products']),
    csvRow(['Product', 'Units', 'Sales (BDT)']),
    ...data.products.map((item) => csvRow([item.product, item.units, (item.sales / 100).toFixed(2)])),
    '',
    csvRow(['Categories']),
    csvRow(['Category', 'Units', 'Sales (BDT)']),
    ...data.categories.map((item) => csvRow([item.category, item.units, (item.sales / 100).toFixed(2)])),
  ]

  return new Response(`\uFEFF${lines.join('\r\n')}`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="sirajibd-analytics-${new Date().toISOString().slice(0, 10)}.csv"`,
      'cache-control': 'private, no-store',
    },
  })
}
