/**
 * BDT amounts are integer poisha everywhere in the system. These functions are
 * the only sanctioned boundary between that and human-readable text.
 *
 * Parsing is deliberately string-based. `parseFloat('19.99') * 100` yields
 * 1998.9999999999998 — the exact class of error that shows up months later as a
 * one-poisha mismatch in reconciliation and takes a day to trace.
 */

export const CURRENCY = 'BDT' as const

export class MoneyParseError extends Error {}

/**
 * '1,999.50' -> 199950. Accepts an optional ৳ or Tk prefix, thousands
 * separators, and zero to two decimal places.
 */
export function parseBdt(input: string): number {
  const cleaned = input
    .trim()
    .replace(/^(৳|Tk\.?|BDT)\s*/i, '')
    .replace(/,/g, '')

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new MoneyParseError(`Not a valid amount: ${input}`)
  }

  const [whole = '0', fraction = ''] = cleaned.split('.')

  // Pad so '19.5' becomes 50 poisha, not 5.
  const poisha = fraction.padEnd(2, '0')

  const result = Number(whole) * 100 + Number(poisha)

  if (!Number.isSafeInteger(result)) {
    throw new MoneyParseError(`Amount out of range: ${input}`)
  }

  return result
}

/** 199950 -> '1,999.50'. No symbol — callers add one where it belongs. */
export function formatBdtPlain(poisha: number): string {
  if (!Number.isInteger(poisha)) {
    throw new MoneyParseError(`Expected integer poisha, received ${poisha}`)
  }

  const negative = poisha < 0
  const abs = Math.abs(poisha)
  const whole = Math.floor(abs / 100)
  const fraction = String(abs % 100).padStart(2, '0')

  return `${negative ? '-' : ''}${whole.toLocaleString('en-US')}.${fraction}`
}

/** 199950 -> '৳1,999.50' */
export function formatBdt(poisha: number): string {
  return `৳${formatBdtPlain(poisha)}`
}

/**
 * 199950 -> '1999.50'. For APIs, never for display.
 *
 * Separate from `formatBdtPlain` because that one groups thousands, which is
 * correct on a page and rejected by a payment gateway — SSLCommerz answered
 * "'total_amount' must be numeric" for "11,700.00". Built from integer parts
 * rather than dividing by 100, so no float rounding can creep into an amount
 * someone is charged.
 */
export function toDecimalString(poisha: number): string {
  if (!Number.isInteger(poisha)) {
    throw new MoneyParseError(`Expected integer poisha, received ${poisha}`)
  }

  const negative = poisha < 0
  const abs = Math.abs(poisha)

  return `${negative ? '-' : ''}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}
