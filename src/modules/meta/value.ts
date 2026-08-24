import { toDecimalString } from '@/lib/money'

/**
 * Conversion happens only at the analytics provider boundary.
 *
 * Uses the same string-based conversion as the payment boundary rather than
 * dividing: `amount / 100` both reintroduces float error and assumes every
 * currency has hundredths. On a JPY store it reported ¥136,000 as 1360 — a
 * hundredfold understatement of revenue, in the number ad bidding optimises
 * against.
 */
export function minorToMetaValue(amount: number) {
  return Number(toDecimalString(amount))
}
