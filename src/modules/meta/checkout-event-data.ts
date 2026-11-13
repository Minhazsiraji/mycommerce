import { CURRENCY } from '@/lib/money'

import { minorToMetaValue } from './value'

/** Keep Pixel and CAPI checkout contents on the same currency/variant basis. */
export function buildCheckoutEventData(lines: Array<{
  variantId: string
  quantity: number
  unitPrice: number
}>) {
  const contents = lines.map((line) => ({
    id: line.variantId,
    quantity: line.quantity,
    item_price: minorToMetaValue(line.unitPrice),
  }))
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  return {
    content_ids: lines.map((line) => line.variantId),
    content_type: 'product' as const,
    contents,
    currency: CURRENCY,
    num_items: lines.reduce((sum, line) => sum + line.quantity, 0),
    value: minorToMetaValue(subtotal),
  }
}
