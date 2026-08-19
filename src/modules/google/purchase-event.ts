import { CURRENCY, toDecimalString } from '@/lib/money'

/**
 * Everything that decides whether a Google `purchase` event may be emitted, and
 * what it contains. Deliberately pure and free of React, `server-only` and the
 * DOM, so the rules can be tested directly instead of through a rendered page.
 *
 * The rules used to live inline in the order page as
 * `paymentStatus === 'paid' && status === 'confirmed'`, shared with Meta's
 * tracker. That predicate was correct about the data but said nothing about the
 * payment method, and it was evaluated in a place that could not be tested.
 */

export type GooglePurchaseItem = {
  item_id: string
  item_name: string
  price: number
  quantity: number
  item_variant?: string
}

export type GooglePurchasePayload = {
  transaction_id: string
  value: number
  currency: string
  shipping: number
  items: GooglePurchaseItem[]
}

/** The shape the order page already has to hand. */
export type PurchaseEligibleOrder = {
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  /** Integer minor units (poisha), per invariant 1 in CLAUDE.md. */
  total: number
  shippingCost: number
  currency: string
  items: Array<{
    sku: string
    variantId: string | null
    productTitle: string
    variantTitle: string | null
    unitPrice: number
    quantity: number
  }>
}

/** The id of the inert JSON block the order page renders for the tag to read. */
export const GOOGLE_PURCHASE_ELEMENT_ID = 'google-purchase-payload'

/** One key per order, so a reload or a second tab cannot report twice. */
export function googlePurchaseStorageKey(transactionId: string): string {
  return `commerce_google_purchase_${transactionId}`
}

/**
 * Money crosses into analytics as a major-unit number, never a float derived by
 * dividing. `toDecimalString` is the same string-based conversion the payment
 * boundary uses, so 136000 poisha becomes exactly 1360, not 1359.9999999999998.
 */
function minorToMajor(minor: number): number {
  return Number(toDecimalString(minor))
}

/**
 * Whether this order represents money actually collected online.
 *
 * Three conditions, and each excludes a real case seen in the database:
 *
 * - `paymentStatus === 'paid'` — excludes `unpaid`, `failed`, `awaiting_transfer`,
 *   `awaiting_verification`, `refunded`, and `cod_pending`.
 * - `status === 'confirmed'` — excludes a cancelled order that was paid late,
 *   which exists in production data (`status=cancelled, paymentStatus=refunded`)
 *   and must never be counted as revenue.
 * - not `cod` — cash on delivery is not an online purchase. A COD order is
 *   `cod_pending` at creation so the first rule already excludes it, but a
 *   delivered COD order is later marked `paid`, and without this it would start
 *   reporting. Excluding the method is the rule that actually holds.
 */
export function isGooglePurchaseEligible(order: PurchaseEligibleOrder): boolean {
  if (order.paymentMethod === 'cod') return false
  return order.paymentStatus === 'paid' && order.status === 'confirmed'
}

/**
 * The `purchase` payload, or null when this order must not report one.
 *
 * `enabled` folds in the admin/env integration switches, so a disabled
 * integration cannot emit even for an otherwise eligible order.
 */
export function buildGooglePurchasePayload(
  order: PurchaseEligibleOrder,
  { enabled }: { enabled: boolean },
): GooglePurchasePayload | null {
  if (!enabled) return null
  if (!isGooglePurchaseEligible(order)) return null

  return {
    transaction_id: order.orderNumber,
    value: minorToMajor(order.total),
    currency: order.currency || CURRENCY,
    shipping: minorToMajor(order.shippingCost),
    items: order.items.map((item) => ({
      // The variant is the thing actually bought; SKU is the fallback for a
      // line whose variant was deleted after the order was placed.
      item_id: item.variantId ?? item.sku,
      item_name: item.productTitle,
      ...(item.variantTitle ? { item_variant: item.variantTitle } : {}),
      price: minorToMajor(item.unitPrice),
      quantity: item.quantity,
    })),
  }
}

/**
 * Parses the payload back out of the DOM block, defensively.
 *
 * Anything malformed yields null rather than throwing: a broken analytics
 * payload must never take the order confirmation page down with it.
 */
export function parseGooglePurchasePayload(raw: string | null | undefined): GooglePurchasePayload | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<GooglePurchasePayload>
    if (
      typeof parsed?.transaction_id !== 'string' ||
      parsed.transaction_id.length === 0 ||
      typeof parsed.value !== 'number' ||
      typeof parsed.currency !== 'string' ||
      typeof parsed.shipping !== 'number' ||
      !Array.isArray(parsed.items)
    ) {
      return null
    }
    return parsed as GooglePurchasePayload
  } catch {
    return null
  }
}
