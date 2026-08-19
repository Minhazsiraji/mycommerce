import 'server-only'

import { desc, ne } from 'drizzle-orm'

import { db } from '@/lib/db'
// Tables come from the schema barrel, not another module's folder — see CLAUDE.md.
import { orders } from '@/lib/db/schema'

import { isGooglePurchaseEligible, type PurchaseEligibleOrder } from './purchase-event'

export type PurchaseDiagnostic = {
  orderNumber: string
  paymentMethod: string
  status: string
  paymentStatus: string
  eligible: boolean
  reason: string
}

/**
 * Why each recent order did or did not report a Google purchase.
 *
 * This exists because the order page cannot answer the question. Its copy says
 * "Order confirmed — payment received" whenever `paymentStatus` is `paid`,
 * regardless of `status`, so an order stuck at `status = 'pending'` looks
 * identical to a fully confirmed one while being correctly ineligible. Chasing
 * that difference through a browser console is slow and easy to get wrong.
 *
 * An operator gets the same value from it: "did this sale report?" is a
 * reasonable thing to want to answer without reading the database.
 */
function explain(order: PurchaseEligibleOrder): string {
  if (order.paymentMethod === 'cod') return 'Cash on delivery — never reported as an online purchase'
  if (order.status === 'cancelled') return 'Order was cancelled'
  if (order.status !== 'confirmed') return `Order status is "${order.status}", not "confirmed"`
  if (order.paymentStatus !== 'paid') return `Payment status is "${order.paymentStatus}", not "paid"`
  return 'Eligible — reports one purchase on the confirmation page'
}

export async function listPurchaseDiagnostics(limit = 8): Promise<PurchaseDiagnostic[]> {
  const rows = await db.query.orders.findMany({
    where: ne(orders.status, 'draft'),
    orderBy: [desc(orders.createdAt)],
    limit,
    with: { items: true },
  })

  return rows.map((row) => {
    const shaped: PurchaseEligibleOrder = {
      orderNumber: row.orderNumber,
      status: row.status,
      paymentStatus: row.paymentStatus,
      paymentMethod: row.paymentMethod,
      total: row.total,
      shippingCost: row.shippingCost,
      currency: row.currency,
      items: row.items.map((item) => ({
        sku: item.sku,
        variantId: item.variantId,
        productTitle: item.productTitle,
        variantTitle: item.variantTitle,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
    }

    return {
      orderNumber: row.orderNumber,
      paymentMethod: row.paymentMethod,
      status: row.status,
      paymentStatus: row.paymentStatus,
      eligible: isGooglePurchaseEligible(shaped),
      reason: explain(shaped),
    }
  })
}
