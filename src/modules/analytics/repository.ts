import 'server-only'

import { and, asc, count, desc, eq, gte, lt, ne, sql, sum } from 'drizzle-orm'

import { db } from '@/lib/db'
import { categories, orderItems, orders, products } from '@/lib/db/schema'

import { resolveAnalyticsRange } from './date-range'
import type { AnalyticsFilters } from './validators'

type Range = { start: Date | null; end: Date | null }

function scope(filters: AnalyticsFilters, range: Range, salesOnly = false) {
  return and(
    range.start ? gte(orders.createdAt, range.start) : undefined,
    range.end ? lt(orders.createdAt, range.end) : undefined,
    salesOnly ? ne(orders.status, 'cancelled') : undefined,
    salesOnly ? eq(orders.paymentStatus, 'paid') : undefined,
    filters.categoryId
      ? sql`exists (select 1 from ${orderItems} where ${orderItems.orderId} = ${orders.id} and ${orderItems.categoryId} = ${filters.categoryId})`
      : undefined,
    filters.productId
      ? sql`exists (select 1 from ${orderItems} where ${orderItems.orderId} = ${orders.id} and ${orderItems.productId} = ${filters.productId})`
      : undefined,
  )
}

const numeric = (value: unknown) => Number(value ?? 0)

async function summary(filters: AnalyticsFilters, range: Range) {
  const [[orderStats], [salesStats], customers, [itemStats]] = await Promise.all([
    db
      .select({
        orders: count(),
        cancelled: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')::int`,
        refunded: sql<number>`count(*) filter (where ${orders.paymentStatus} = 'refunded')::int`,
        pending: sql<number>`count(*) filter (where ${orders.paymentStatus} not in ('paid', 'refunded', 'failed'))::int`,
      })
      .from(orders)
      .where(scope(filters, range)),
    db
      .select({
        salesOrders: count(),
        sales: sum(orders.total),
        merchandise: sum(orders.subtotal),
        shipping: sum(orders.shippingCost),
        discount: sum(orders.discountAmount),
      })
      .from(orders)
      .where(scope(filters, range, true)),
    db
      .select({ customer: sql<string>`lower(${orders.email})`, orders: count() })
      .from(orders)
      .where(scope(filters, range, true))
      .groupBy(sql`lower(${orders.email})`),
    db
      .select({ units: sum(orderItems.quantity), itemSales: sum(orderItems.lineTotal) })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          scope(filters, range, true),
          filters.categoryId ? eq(orderItems.categoryId, filters.categoryId) : undefined,
          filters.productId ? eq(orderItems.productId, filters.productId) : undefined,
        ),
      ),
  ])

  const salesOrders = numeric(salesStats?.salesOrders)
  return {
    orders: numeric(orderStats?.orders),
    salesOrders,
    sales: numeric(salesStats?.sales),
    merchandise: numeric(salesStats?.merchandise),
    shipping: numeric(salesStats?.shipping),
    discount: numeric(salesStats?.discount),
    averageOrderValue: salesOrders ? Math.round(numeric(salesStats?.sales) / salesOrders) : 0,
    cancelled: numeric(orderStats?.cancelled),
    refunded: numeric(orderStats?.refunded),
    pending: numeric(orderStats?.pending),
    uniqueCustomers: customers.length,
    repeatCustomers: customers.filter((customer) => numeric(customer.orders) > 1).length,
    units: numeric(itemStats?.units),
    itemSales: numeric(itemStats?.itemSales),
  }
}

function bucketExpression(group: 'day' | 'month' | 'year') {
  /**
   * These are server-owned constants, deliberately written as SQL literals.
   * Interpolating the timezone makes Drizzle allocate different bind parameters
   * when the expression is repeated in SELECT and GROUP BY. PostgreSQL then
   * sees two non-identical expressions and rejects the aggregate query.
   */
  if (group === 'day') return sql<string>`to_char(date_trunc('day', timezone('Asia/Dhaka', ${orders.createdAt})), 'YYYY-MM-DD')`
  if (group === 'month') return sql<string>`to_char(date_trunc('month', timezone('Asia/Dhaka', ${orders.createdAt})), 'YYYY-MM')`
  return sql<string>`to_char(date_trunc('year', timezone('Asia/Dhaka', ${orders.createdAt})), 'YYYY')`
}

export async function getAnalytics(filters: AnalyticsFilters) {
  const range = resolveAnalyticsRange(filters)
  const bucket = bucketExpression(range.group)
  const currentPromise = summary(filters, range)
  const previousPromise = range.previous ? summary(filters, range.previous) : Promise.resolve(null)

  const productGroup = sql<string>`coalesce(${orderItems.productId}::text, ${orderItems.productTitle})`
  const categoryGroup = sql<string>`coalesce(${orderItems.categoryId}::text, ${orderItems.categoryName}, 'uncategorised')`

  const [current, previous, trend, productRows, categoryRows, paymentRows, productOptions, categoryOptions] = await Promise.all([
    currentPromise,
    previousPromise,
    db
      .select({ period: bucket, sales: sum(orders.total), orders: count() })
      .from(orders)
      .where(scope(filters, range, true))
      .groupBy(bucket)
      .orderBy(asc(bucket)),
    db
      .select({
        productId: productGroup,
        product: sql<string>`max(${orderItems.productTitle})`,
        units: sum(orderItems.quantity),
        sales: sum(orderItems.lineTotal),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          scope(filters, range, true),
          filters.categoryId ? eq(orderItems.categoryId, filters.categoryId) : undefined,
          filters.productId ? eq(orderItems.productId, filters.productId) : undefined,
        ),
      )
      .groupBy(productGroup)
      .orderBy(desc(sum(orderItems.lineTotal)))
      .limit(20),
    db
      .select({
        categoryId: categoryGroup,
        category: sql<string>`max(coalesce(${orderItems.categoryName}, 'Uncategorised'))`,
        units: sum(orderItems.quantity),
        sales: sum(orderItems.lineTotal),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          scope(filters, range, true),
          filters.categoryId ? eq(orderItems.categoryId, filters.categoryId) : undefined,
          filters.productId ? eq(orderItems.productId, filters.productId) : undefined,
        ),
      )
      .groupBy(categoryGroup)
      .orderBy(desc(sum(orderItems.lineTotal))),
    db
      .select({ method: orders.paymentMethod, status: orders.paymentStatus, orders: count(), value: sum(orders.total) })
      .from(orders)
      .where(scope(filters, range))
      .groupBy(orders.paymentMethod, orders.paymentStatus)
      .orderBy(desc(count())),
    db.select({ id: products.id, title: products.title }).from(products).orderBy(asc(products.title)),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
  ])

  const productsResult = productRows.map((row) => ({ ...row, units: numeric(row.units), sales: numeric(row.sales) }))
  const categoriesResult = categoryRows.map((row) => ({ ...row, units: numeric(row.units), sales: numeric(row.sales) }))

  return {
    filters,
    range,
    current,
    previous,
    trend: trend.map((row) => ({ ...row, orders: numeric(row.orders), sales: numeric(row.sales) })),
    products: productsResult,
    categories: categoriesResult,
    payments: paymentRows.map((row) => ({ ...row, orders: numeric(row.orders), value: numeric(row.value) })),
    productOptions,
    categoryOptions,
    units: current.units,
  }
}
