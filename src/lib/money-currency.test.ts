import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Currency portability.
 *
 * money.ts used to export `CURRENCY = 'BDT'` as a compile-time constant while
 * STORE_CURRENCY independently drove SEO metadata and the Merchant feed. A
 * store configured as USD would therefore advertise USD prices to Google and
 * charge BDT — the two halves could disagree, and nothing failed. These tests
 * pin them to one source.
 */
async function withCurrency(
  env: Record<string, string>,
  assertions: (money: typeof import('./money')) => void | Promise<void>,
) {
  vi.resetModules()
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)

  const money = await import('./money')
  await assertions(money)
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('the configured currency is authoritative', () => {
  it('reports the configured code, not a compiled-in one', async () => {
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'USD' }, (money) => {
      expect(money.CURRENCY).toBe('USD')
      expect(money.CURRENCY).not.toBe('BDT')
    })
  })

  it('formats with the currency symbol that belongs to it', async () => {
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'USD' }, (money) => {
      expect(money.formatMoney(199950)).toBe('$1,999.50')
    })
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'GBP' }, (money) => {
      expect(money.formatMoney(199950)).toBe('£1,999.50')
    })
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'EUR' }, (money) => {
      expect(money.formatMoney(199950)).toBe('€1,999.50')
    })
  })

  it('keeps the original store rendering byte-for-byte', async () => {
    // SirajiBD's live prices must not change shape because the code became
    // configurable underneath them.
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'BDT' }, (money) => {
      expect(money.formatMoney(199950)).toBe('৳1,999.50')
      expect(money.formatMoneyPlain(199950)).toBe('1,999.50')
      expect(money.toDecimalString(199950)).toBe('1999.50')
    })
  })

  it('falls back to the ISO code rather than guessing a symbol', async () => {
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'SEK' }, (money) => {
      expect(money.formatMoney(199950)).toBe('SEK1,999.50')
    })
  })

  it('accepts an explicitly configured symbol', async () => {
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'SEK', NEXT_PUBLIC_STORE_CURRENCY_SYMBOL: 'kr' }, (money) => {
      // Prefix placement only. Currencies conventionally written as a suffix
      // ("1 999,50 kr") render as "kr1,999.50" here — unambiguous but not
      // idiomatic. Placement is a known gap, not a silent one.
      expect(money.formatMoney(199950)).toBe('kr1,999.50')
    })
  })
})

describe('currencies that do not subdivide by 100', () => {
  it('formats yen as whole units', async () => {
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'JPY' }, (money) => {
      expect(money.formatMoney(199950)).toBe('¥199,950')
      expect(money.toDecimalString(199950)).toBe('199950')
    })
  })

  it('parses yen without inventing a fractional part', async () => {
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'JPY' }, (money) => {
      expect(money.parseMoney('199,950')).toBe(199950)
      // 100 yen is 100 yen, not 10000 of anything.
      expect(money.parseMoney('100')).toBe(100)
      expect(() => money.parseMoney('100.50')).toThrow(money.MoneyParseError)
    })
  })

  it('round-trips every supported subdivision', async () => {
    for (const currency of ['BDT', 'USD', 'JPY']) {
      await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: currency }, (money) => {
        const parsed = money.parseMoney(money.formatMoneyPlain(123456))
        expect(parsed).toBe(123456)
      })
    }
  })
})

describe('parsing tolerates how people actually type amounts', () => {
  it('strips whichever symbol or code the store uses', async () => {
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'USD' }, (money) => {
      for (const input of ['$1,999.50', 'USD 1999.50', '1999.50', '  $1999.5 ']) {
        expect(money.parseMoney(input)).toBe(199950)
      }
    })
  })

  it('still accepts the legacy Tk prefix on a BDT store', async () => {
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'BDT' }, (money) => {
      expect(money.parseMoney('Tk 1,999.50')).toBe(199950)
      expect(money.parseMoney('৳1,999.50')).toBe(199950)
    })
  })

  it('refuses a negative amount rather than silently accepting one', async () => {
    await withCurrency({ NEXT_PUBLIC_STORE_CURRENCY: 'USD' }, (money) => {
      expect(() => money.parseMoney('-10.00')).toThrow(money.MoneyParseError)
    })
  })
})
