import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * One currency, every surface.
 *
 * These used to be decided independently: money.ts held `CURRENCY = 'BDT'` as a
 * constant, the Merchant feed and JSON-LD read STORE_CURRENCY, and the Meta and
 * Google payloads wrote 'BDT' inline. Nothing compared them, so a store
 * configured for USD could advertise USD to Google, render BDT on the page and
 * send BDT to the gateway — three different answers to what the customer is
 * paying.
 *
 * This asserts every surface agrees under a non-BD currency, and again under a
 * zero-decimal one where the "divide by 100" assumption would show up.
 */
async function underCurrency(currency: string) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_STORE_CURRENCY', currency)
  vi.stubEnv('STORE_NAME', 'Client Store')
  vi.stubEnv('STORE_CANONICAL_URL', 'https://client.example')

  const [money, storeConfig, metaPurchase, googlePurchase, merchantFeed] = await Promise.all([
    import('@/lib/money'),
    import('@/lib/store-config'),
    import('@/modules/meta/purchase-data'),
    import('@/modules/google/purchase-event'),
    import('@/modules/catalog/merchant-feed'),
  ])

  return { money, storeConfig, metaPurchase, googlePurchase, merchantFeed }
}

const order = {
  total: 136000,
  items: [{ sku: 'SKU-1', variantId: 'variant-1', unitPrice: 65000, quantity: 2 }],
}

const googleOrder = {
  orderNumber: 'MC-TEST-0001',
  paymentMethod: 'sslcommerz' as const,
  paymentStatus: 'paid' as const,
  status: 'confirmed' as const,
  total: 136000,
  shippingCost: 6000,
  currency: '',
  items: [
    {
      sku: 'SKU-1',
      variantId: 'variant-1',
      productTitle: 'A product',
      variantTitle: null,
      unitPrice: 65000,
      quantity: 2,
    },
  ],
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe.each(['USD', 'EUR', 'JPY'])('every surface reports %s', (currency) => {
  it('agrees across config, money, analytics and feed', async () => {
    const m = await underCurrency(currency)

    const reported = new Set<string>([
      m.storeConfig.STORE_CONFIG.currency,
      m.money.CURRENCY,
      m.metaPurchase.buildMetaPurchaseData(order).currency!,
      m.googlePurchase.buildGooglePurchasePayload(
        { ...googleOrder, currency: m.money.CURRENCY },
        { enabled: true },
      )!.currency,
    ])

    expect([...reported]).toEqual([currency])
  })

  it('puts that currency in the Merchant feed', async () => {
    const m = await underCurrency(currency)

    const xml = m.merchantFeed.buildGoogleMerchantFeed(
      [
        {
          id: 'p1',
          slug: 'a-product',
          title: 'A product',
          description: 'A product description for the feed.',
          feedDescription: null,
          brand: 'Brand',
          condition: 'new',
          productCategory: null,
          mpn: null,
          identifierExists: true,
          categoryName: null,
          imageUrls: ['https://client.example/image.jpg'],
          variants: [
            {
              id: 'variant-1',
              sku: 'SKU-1',
              title: 'Default',
              price: 65000,
              compareAtPrice: null,
              stock: 3,
              barcode: null,
              options: {},
            },
          ],
        },
      ],
      {
        storeName: m.storeConfig.STORE_CONFIG.name,
        siteUrl: m.storeConfig.STORE_CONFIG.canonicalUrl,
        currency: m.storeConfig.STORE_CONFIG.currency,
      },
    )

    expect(xml).toContain(currency)
    expect(xml).not.toContain('BDT')
  })
})

describe('a zero-decimal currency is not quietly divided by 100', () => {
  it('reports whole units everywhere', async () => {
    const m = await underCurrency('JPY')

    expect(m.storeConfig.STORE_CONFIG.currencyMinorUnits).toBe(0)
    expect(m.money.formatMoney(136000)).toBe('¥136,000')
    expect(m.money.toDecimalString(136000)).toBe('136000')

    // 136000 yen is 136000, not 1360.
    expect(m.metaPurchase.buildMetaPurchaseData(order).value).toBe(136000)
  })
})

describe('no Bangladeshi default survives a reconfigured store', () => {
  it('leaves no BDT, taka sign or +880 in what a USD store emits', async () => {
    const m = await underCurrency('USD')

    const emitted = JSON.stringify({
      config: m.storeConfig.STORE_CONFIG,
      money: { currency: m.money.CURRENCY, symbol: m.money.CURRENCY_SYMBOL },
      meta: m.metaPurchase.buildMetaPurchaseData(order),
      google: m.googlePurchase.buildGooglePurchasePayload(
        { ...googleOrder, currency: 'USD' },
        { enabled: true },
      ),
    })

    expect(emitted).not.toMatch(/BDT/)
    expect(emitted).not.toMatch(/৳/)
    expect(emitted).not.toMatch(/\+880/)
  })
})
