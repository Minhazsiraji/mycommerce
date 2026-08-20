import { CURRENCY } from '@/lib/money'

import { minorToMetaValue } from './value'
import type { MetaCustomData } from './validators'

/**
 * The single definition of a Meta Purchase's custom data.
 *
 * Browser Pixel and server CAPI must describe the same sale, or Meta cannot
 * deduplicate them and reported revenue drifts. Until now each side built its
 * own object literal — identical by inspection, but nothing stopped them
 * diverging the next time either was edited. One builder makes the two
 * physically incapable of disagreeing.
 *
 * Currency comes from `CURRENCY`, the same constant the money layer uses, so
 * "what currency is this store in?" has one answer rather than string literals
 * scattered across the analytics code.
 */
export type MetaPurchaseOrder = {
  total: number
  items: Array<{
    sku: string
    variantId: string | null
    unitPrice: number
    quantity: number
  }>
}

export function buildMetaPurchaseData(order: MetaPurchaseOrder): MetaCustomData {
  return {
    content_ids: order.items.map((item) => item.variantId ?? item.sku),
    content_type: 'product',
    contents: order.items.map((item) => ({
      id: item.variantId ?? item.sku,
      quantity: item.quantity,
      // Major units, and a real number — Meta rejects prices sent as strings.
      item_price: minorToMetaValue(item.unitPrice),
    })),
    currency: CURRENCY,
    num_items: order.items.reduce((total, item) => total + item.quantity, 0),
    value: minorToMetaValue(order.total),
  }
}

/**
 * Whether custom data is safe to hand to `fbq('track', 'Purchase', …)`.
 *
 * Meta's browser library rejects a Purchase whose currency is missing or not a
 * currency code, with exactly the console message
 * "Parameter 'currency' is invalid for event 'Purchase'". A Purchase that fails
 * that check is not recorded, so emitting one is strictly worse than emitting
 * nothing: it produces a warning, no conversion, and a misleading impression
 * that reporting is working.
 *
 * This is a guard, not a silencer — it never edits or drops `currency` to make
 * a warning go away. It refuses to send a payload that could not be counted,
 * and CAPI still carries the authoritative event either way.
 */
export function isSendableMetaPurchaseData(data: unknown): data is MetaCustomData {
  if (!data || typeof data !== 'object') return false

  const candidate = data as MetaCustomData
  if (typeof candidate.currency !== 'string' || !/^[A-Z]{3}$/.test(candidate.currency)) return false
  if (typeof candidate.value !== 'number' || !Number.isFinite(candidate.value) || candidate.value < 0) {
    return false
  }

  if (candidate.contents !== undefined) {
    if (!Array.isArray(candidate.contents)) return false
    for (const item of candidate.contents) {
      if (!item || typeof item !== 'object') return false
      if (typeof item.item_price !== 'number' || !Number.isFinite(item.item_price)) return false
      if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity)) return false
    }
  }

  return true
}
