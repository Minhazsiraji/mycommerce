/**
 * Amounts are integer minor units everywhere in the system — poisha for BDT,
 * cents for USD, whole yen for JPY. These functions are the only sanctioned
 * boundary between that and human-readable text.
 *
 * Every value here comes from STORE_CONFIG, so one store's currency is
 * authoritative across price, cart, checkout, order, payment, email, analytics,
 * JSON-LD and the Merchant feed. A store configured as USD that advertised USD
 * in the feed while formatting and charging BDT would be commercially
 * dangerous, so the code, the symbol and the subdivision all come from the same
 * place rather than being decided per call site.
 *
 * Parsing is deliberately string-based. `parseFloat('19.99') * 100` yields
 * 1998.9999999999998 — the exact class of error that shows up months later as a
 * one-minor-unit mismatch in reconciliation and takes a day to trace.
 */
import { STORE_CONFIG } from './store-config'

export const CURRENCY = STORE_CONFIG.currency
export const CURRENCY_SYMBOL = STORE_CONFIG.currencySymbol

const MINOR_DIGITS = STORE_CONFIG.currencyMinorUnits
const MINOR_FACTOR = 10 ** MINOR_DIGITS
const GROUPING_LOCALE = STORE_CONFIG.numberLocale

export class MoneyParseError extends Error {}

/**
 * '1,999.50' -> 199950. Accepts an optional currency symbol or code prefix,
 * thousands separators, and up to the currency's own number of decimals.
 *
 * The prefix is stripped by shape rather than by an allow-list, so '৳', 'Tk',
 * 'BDT', '$' and 'USD' all work without money.ts knowing which store it is
 * running in.
 */
export function parseMoney(input: string): number {
  const cleaned = input
    .trim()
    .replace(/^[^\d.-]+\s*/, '')
    .replace(/,/g, '')

  const pattern = MINOR_DIGITS === 0 ? /^\d+$/ : new RegExp(`^\\d+(\\.\\d{1,${MINOR_DIGITS}})?$`)

  if (!pattern.test(cleaned)) {
    throw new MoneyParseError(`Not a valid amount: ${input}`)
  }

  const [whole = '0', fraction = ''] = cleaned.split('.')

  // Pad so '19.5' becomes 50 poisha, not 5.
  const minor = MINOR_DIGITS === 0 ? '0' : fraction.padEnd(MINOR_DIGITS, '0')

  const result = Number(whole) * MINOR_FACTOR + Number(minor)

  if (!Number.isSafeInteger(result)) {
    throw new MoneyParseError(`Amount out of range: ${input}`)
  }

  return result
}

/** 199950 -> '1,999.50'. No symbol — callers add one where it belongs. */
export function formatMoneyPlain(minor: number): string {
  if (!Number.isInteger(minor)) {
    throw new MoneyParseError(`Expected integer minor units, received ${minor}`)
  }

  const negative = minor < 0
  const abs = Math.abs(minor)
  const whole = Math.floor(abs / MINOR_FACTOR)
  const sign = negative ? '-' : ''

  if (MINOR_DIGITS === 0) return `${sign}${whole.toLocaleString(GROUPING_LOCALE)}`

  const fraction = String(abs % MINOR_FACTOR).padStart(MINOR_DIGITS, '0')
  return `${sign}${whole.toLocaleString(GROUPING_LOCALE)}.${fraction}`
}

/** 199950 -> '৳1,999.50' for a BDT store, '$1,999.50' for a USD one. */
export function formatMoney(minor: number): string {
  return `${CURRENCY_SYMBOL}${formatMoneyPlain(minor)}`
}

/**
 * 199950 -> '1999.50'. For APIs, never for display.
 *
 * Separate from `formatMoneyPlain` because that one groups thousands, which is
 * correct on a page and rejected by a payment gateway — SSLCommerz answered
 * "'total_amount' must be numeric" for "11,700.00". Built from integer parts
 * rather than dividing, so no float rounding can creep into an amount someone
 * is charged.
 */
export function toDecimalString(minor: number): string {
  if (!Number.isInteger(minor)) {
    throw new MoneyParseError(`Expected integer minor units, received ${minor}`)
  }

  const negative = minor < 0
  const abs = Math.abs(minor)
  const sign = negative ? '-' : ''
  const whole = Math.floor(abs / MINOR_FACTOR)

  if (MINOR_DIGITS === 0) return `${sign}${whole}`

  return `${sign}${whole}.${String(abs % MINOR_FACTOR).padStart(MINOR_DIGITS, '0')}`
}

/**
 * Names kept from when this file was BDT-only. Call sites are unchanged so that
 * making currency configurable did not also become a fifty-file rename, which
 * would have buried the behavioural change in noise.
 */
export const parseBdt = parseMoney
export const formatBdtPlain = formatMoneyPlain
export const formatBdt = formatMoney
