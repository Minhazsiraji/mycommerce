import { describe, expect, it } from 'vitest'

// @ts-expect-error -- plain ESM module shared with the preflight script.
import { preflight as run } from '../../scripts/preflight-rules.mjs'

const preflight = run as (env: Record<string, string | undefined>) => {
  errors: string[]
  warnings: string[]
}

/** A coherent Bangladeshi production deployment. */
const healthy = {
  VERCEL_ENV: 'production',
  STORE_NAME: 'SirajiBD',
  STORE_CANONICAL_URL: 'https://sirajibd.com',
  NEXT_PUBLIC_STORE_CURRENCY: 'BDT',
  NEXT_PUBLIC_STORE_COUNTRY_CODE: 'BD',
  SSLCOMMERZ_STORE_ID: 'id',
  SSLCOMMERZ_STORE_PASSWORD: 'pw',
  SSLCOMMERZ_SANDBOX: 'false',
}

const errorsFor = (env: Record<string, string | undefined>) => preflight(env).errors.join(' | ')

describe('a coherent deployment passes', () => {
  it('accepts the production configuration', () => {
    expect(preflight(healthy).errors).toEqual([])
  })

  it('accepts a bare clone with nothing but cash on delivery', () => {
    // The floor: a store can open before it has a gateway.
    expect(
      preflight({
        VERCEL_ENV: 'production',
        STORE_NAME: 'Client Store',
        STORE_CANONICAL_URL: 'https://client.example',
      }).errors,
    ).toEqual([])
  })
})

describe('incomplete production identity', () => {
  it.each(['STORE_NAME', 'STORE_CANONICAL_URL'])('fails without %s', (name) => {
    expect(errorsFor({ ...healthy, [name]: '' })).toContain(name)
  })

  it('allows both to be absent outside production', () => {
    expect(preflight({ STORE_NAME: '', STORE_CANONICAL_URL: '' }).errors).toEqual([])
  })
})

describe('browser and server must agree', () => {
  it('fails when only the private name is set', () => {
    expect(errorsFor({ ...healthy, STORE_CURRENCY: 'USD' })).toContain(
      'NEXT_PUBLIC_STORE_CURRENCY',
    )
  })

  it('fails when the pair disagrees', () => {
    expect(errorsFor({ ...healthy, STORE_CURRENCY: 'EUR' })).toMatch(/disagree/)
  })

  it('accepts a matching pair', () => {
    expect(preflight({ ...healthy, STORE_CURRENCY: 'BDT' }).errors).toEqual([])
  })
})

describe('malformed country and currency', () => {
  it('rejects a currency that is not an ISO code', () => {
    for (const bad of ['TAKA', '৳', 'B', '12']) {
      expect(errorsFor({ ...healthy, NEXT_PUBLIC_STORE_CURRENCY: bad })).toMatch(/ISO 4217/)
    }
  })

  it('rejects a country that is not an ISO code', () => {
    for (const bad of ['BGD', 'Bangladesh', 'B']) {
      expect(errorsFor({ ...healthy, NEXT_PUBLIC_STORE_COUNTRY_CODE: bad })).toMatch(/ISO 3166/)
    }
  })
})

describe('a store nobody can buy from', () => {
  it('fails when every payment method is off', () => {
    expect(
      errorsFor({
        VERCEL_ENV: 'production',
        STORE_NAME: 'Client Store',
        STORE_CANONICAL_URL: 'https://client.example',
        STORE_COD_ENABLED: 'false',
      }),
    ).toMatch(/No payment method is available/)
  })

  it('passes when COD is off but a gateway is configured', () => {
    expect(
      preflight({ ...healthy, STORE_COD_ENABLED: 'false' }).errors,
    ).toEqual([])
  })

  it('passes when COD is off but bank details exist', () => {
    expect(
      preflight({
        VERCEL_ENV: 'production',
        STORE_NAME: 'Client Store',
        STORE_CANONICAL_URL: 'https://client.example',
        STORE_COD_ENABLED: 'false',
        BANK_ACCOUNT_NAME: 'Client Ltd',
        BANK_ACCOUNT_NUMBER: '1234',
        BANK_NAME: 'A Bank',
      }).errors,
    ).toEqual([])
  })
})

describe('live payment configuration', () => {
  it('refuses live mode without credentials', () => {
    expect(
      errorsFor({ ...healthy, SSLCOMMERZ_STORE_ID: '', SSLCOMMERZ_STORE_PASSWORD: '' }),
    ).toMatch(/no SSLCommerz credentials/)
  })

  it('refuses live mode outside production', () => {
    // The exact hazard in the current Vercel setup: SSLCOMMERZ_SANDBOX is one
    // value shared by Preview and Production, so a live flag makes every
    // Preview capable of taking real money.
    expect(errorsFor({ ...healthy, VERCEL_ENV: 'preview' })).toMatch(/would take real payments/)
  })

  it('warns when production is left in sandbox', () => {
    expect(preflight({ ...healthy, SSLCOMMERZ_SANDBOX: 'true' }).warnings.join(' ')).toMatch(
      /sandbox/,
    )
  })
})

describe('identity leakage', () => {
  it('refuses a clone pointing at the original domain', () => {
    expect(
      errorsFor({
        VERCEL_ENV: 'preview',
        STORE_NAME: 'Commerce Clone Test',
        STORE_CANONICAL_URL: 'https://sirajibd.com',
      }),
    ).toMatch(/must use its own domain/)
  })

  it('leaves the original production deployment alone', () => {
    expect(preflight(healthy).errors).toEqual([])
  })
})

describe('tax configuration', () => {
  it('rejects an unknown mode', () => {
    expect(errorsFor({ ...healthy, NEXT_PUBLIC_STORE_TAX_MODE: 'vat' })).toMatch(/must be one of/)
  })

  it('rejects a rate that is not whole basis points in range', () => {
    for (const bad of ['7.5', '-1', '10001', 'abc']) {
      expect(
        errorsFor({ ...healthy, NEXT_PUBLIC_STORE_TAX_RATE_BASIS_POINTS: bad }),
      ).toMatch(/basis points/)
    }
  })

  it('accepts a valid rate', () => {
    expect(
      preflight({
        ...healthy,
        NEXT_PUBLIC_STORE_TAX_MODE: 'inclusive',
        NEXT_PUBLIC_STORE_TAX_RATE_BASIS_POINTS: '750',
      }).errors,
    ).toEqual([])
  })

  it('warns about a mode and rate that cancel each other out', () => {
    expect(
      preflight({ ...healthy, NEXT_PUBLIC_STORE_TAX_MODE: 'exclusive' }).warnings.join(' '),
    ).toMatch(/rate is 0/)
    expect(
      preflight({ ...healthy, NEXT_PUBLIC_STORE_TAX_RATE_BASIS_POINTS: '750' }).warnings.join(' '),
    ).toMatch(/mode is "none"/)
  })
})
