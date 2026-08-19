import { describe, expect, it } from 'vitest'

import { PAYMENT_CONFIRM_MAX_ATTEMPTS } from './components/payment-confirming-refresh'

/**
 * The refresh loop is bounded because it lives in the URL and a customer whose
 * IPN never arrives must not reload forever.
 */
describe('payment confirmation refresh bound', () => {
  it('stops after a finite number of attempts', () => {
    expect(PAYMENT_CONFIRM_MAX_ATTEMPTS).toBeGreaterThan(0)
    expect(PAYMENT_CONFIRM_MAX_ATTEMPTS).toBeLessThanOrEqual(10)
  })

  it('gives the IPN a realistic window without stranding the customer', () => {
    // 5 attempts at 3s is ~15s of waiting: long enough for a sandbox IPN,
    // short enough that a dropped one does not trap the page.
    const totalSeconds = PAYMENT_CONFIRM_MAX_ATTEMPTS * 3
    expect(totalSeconds).toBeGreaterThanOrEqual(9)
    expect(totalSeconds).toBeLessThanOrEqual(60)
  })
})

/** Mirrors the clamp the order page applies to the `?c=` parameter. */
function clampAttempt(raw: string | undefined): number {
  return Math.min(Math.max(Number(raw) || 0, 0), 99)
}

describe('attempt counter clamping', () => {
  it.each([
    ['absent', undefined, 0],
    ['empty', '', 0],
    ['zero', '0', 0],
    ['a normal value', '3', 3],
    ['nonsense', 'abc', 0],
    ['negative', '-5', 0],
    ['absurdly large', '999999', 99],
  ])('treats %s as %s', (_label, raw, expected) => {
    expect(clampAttempt(raw as string | undefined)).toBe(expected)
  })

  it('cannot be driven past the stop condition by a hand-edited URL', () => {
    expect(clampAttempt('999999')).toBeGreaterThanOrEqual(PAYMENT_CONFIRM_MAX_ATTEMPTS)
  })
})
