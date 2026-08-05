import { describe, expect, it } from 'vitest'

import { formatBdt, formatBdtPlain, MoneyParseError, parseBdt, toDecimalString } from './money'

describe('parseBdt', () => {
  it('converts whole and decimal amounts to poisha', () => {
    expect(parseBdt('1999')).toBe(199900)
    expect(parseBdt('1999.50')).toBe(199950)
    expect(parseBdt('0.05')).toBe(5)
    expect(parseBdt('0')).toBe(0)
  })

  it('pads a single decimal place correctly', () => {
    // '19.5' is 50 poisha, not 5 — the obvious off-by-10x bug.
    expect(parseBdt('19.5')).toBe(1950)
  })

  it('avoids floating point error', () => {
    // parseFloat('19.99') * 100 === 1998.9999999999998
    expect(parseBdt('19.99')).toBe(1999)
    expect(parseBdt('0.29')).toBe(29)
    expect(parseBdt('1.10')).toBe(110)
  })

  it('accepts separators and currency prefixes', () => {
    expect(parseBdt('1,999.50')).toBe(199950)
    expect(parseBdt('৳1,999.50')).toBe(199950)
    expect(parseBdt('Tk 250')).toBe(25000)
    expect(parseBdt('  1999  ')).toBe(199900)
  })

  it('rejects malformed input rather than coercing it', () => {
    for (const bad of ['', 'abc', '19.999', '-5', '1.2.3', '19.', '1e3']) {
      expect(() => parseBdt(bad), bad).toThrow(MoneyParseError)
    }
  })
})

describe('formatBdt', () => {
  it('formats poisha back to text', () => {
    expect(formatBdtPlain(199950)).toBe('1,999.50')
    expect(formatBdtPlain(5)).toBe('0.05')
    expect(formatBdtPlain(0)).toBe('0.00')
    expect(formatBdt(199900)).toBe('৳1,999.00')
  })

  it('handles negatives, for refunds and discounts', () => {
    expect(formatBdtPlain(-199950)).toBe('-1,999.50')
  })

  it('refuses a non-integer, which would mean poisha got lost upstream', () => {
    expect(() => formatBdtPlain(1999.5)).toThrow(MoneyParseError)
  })
})

describe('toDecimalString', () => {
  it('never groups thousands', () => {
    // A separator here is not cosmetic: SSLCommerz rejected "11,700.00" with
    // "'total_amount' must be numeric", which failed every card payment.
    expect(toDecimalString(1170000)).toBe('11700.00')
    expect(toDecimalString(123456789)).toBe('1234567.89')
    expect(toDecimalString(199950)).not.toContain(',')
  })

  it('always keeps two decimal places', () => {
    expect(toDecimalString(199900)).toBe('1999.00')
    expect(toDecimalString(5)).toBe('0.05')
    expect(toDecimalString(0)).toBe('0.00')
  })

  it('avoids float error by building from integer parts', () => {
    // 1999 / 100 is not exactly representable in binary floating point.
    expect(toDecimalString(1999)).toBe('19.99')
    expect(toDecimalString(29)).toBe('0.29')
  })

  it('parses back to the same amount', () => {
    for (const poisha of [0, 5, 1999, 199950, 1170000]) {
      expect(parseBdt(toDecimalString(poisha))).toBe(poisha)
    }
  })
})

describe('round trip', () => {
  it('survives parse -> format -> parse', () => {
    for (const input of ['0', '0.01', '19.99', '1,999.50', '123456.78']) {
      const poisha = parseBdt(input)
      expect(parseBdt(formatBdtPlain(poisha))).toBe(poisha)
    }
  })
})
