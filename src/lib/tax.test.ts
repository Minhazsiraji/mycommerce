import { describe, expect, it } from 'vitest'

import { calculateOrderTotals, showsTaxLine, taxLineLabel, type TaxConfig } from './tax'

const NONE: TaxConfig = { mode: 'none', rateBasisPoints: 0, label: 'Tax', appliesToShipping: false }
const VAT_INCLUSIVE: TaxConfig = {
  mode: 'inclusive',
  rateBasisPoints: 750,
  label: 'VAT',
  appliesToShipping: false,
}
const SALES_TAX: TaxConfig = {
  mode: 'exclusive',
  rateBasisPoints: 875,
  label: 'Sales tax',
  appliesToShipping: false,
}

/** A real order: two units at 65000 minor plus 6000 delivery. */
const order = { subtotal: 130000, shippingCost: 6000 }

describe('the existing behaviour is the default', () => {
  it('leaves totals exactly as they were before tax existed', () => {
    const totals = calculateOrderTotals(order, NONE)

    expect(totals.total).toBe(136000)
    expect(totals.total).toBe(order.subtotal + order.shippingCost)
    expect(totals.taxAmount).toBe(0)
  })

  it('treats a zero rate as no tax whatever the mode', () => {
    for (const mode of ['inclusive', 'exclusive'] as const) {
      const totals = calculateOrderTotals(order, { ...NONE, mode })
      expect(totals.taxAmount).toBe(0)
      expect(totals.total).toBe(136000)
    }
  })
})

describe('tax included in the price', () => {
  it('does not change what the customer pays', () => {
    // A disclosure, not a charge. Getting this wrong silently raises every price.
    expect(calculateOrderTotals(order, VAT_INCLUSIVE).total).toBe(136000)
  })

  it('reports the tax the price already contains', () => {
    // 130000 gross at 7.5% contains 130000 - round(130000/1.075) = 9070.
    expect(calculateOrderTotals(order, VAT_INCLUSIVE).taxAmount).toBe(9070)
  })

  it('extracts the net rather than multiplying the gross', () => {
    // Multiplying would give round(130000 * 0.075) = 9750 — 680 too much, and
    // it would not reconcile against the price actually charged.
    expect(calculateOrderTotals(order, VAT_INCLUSIVE).taxAmount).not.toBe(9750)
  })

  it('includes shipping in the base when configured to', () => {
    const withShipping = calculateOrderTotals(order, { ...VAT_INCLUSIVE, appliesToShipping: true })

    expect(withShipping.taxAmount).toBeGreaterThan(
      calculateOrderTotals(order, VAT_INCLUSIVE).taxAmount,
    )
    expect(withShipping.total).toBe(136000)
  })
})

describe('tax added at checkout', () => {
  it('adds tax on top of the subtotal', () => {
    const totals = calculateOrderTotals(order, SALES_TAX)

    expect(totals.taxAmount).toBe(11375) // round(130000 * 0.0875)
    expect(totals.total).toBe(130000 + 6000 + 11375)
  })

  it('taxes shipping only when configured', () => {
    const taxed = calculateOrderTotals(order, { ...SALES_TAX, appliesToShipping: true })

    expect(taxed.taxAmount).toBe(11900) // round(136000 * 0.0875)
    expect(taxed.total).toBe(130000 + 6000 + 11900)
  })

  it('produces a total the customer can verify by adding the lines up', () => {
    const t = calculateOrderTotals(order, SALES_TAX)
    expect(t.subtotal - t.discountAmount + t.shippingCost + t.taxAmount).toBe(t.total)
  })
})

describe('the order of operations is fixed', () => {
  const discounted = { subtotal: 130000, shippingCost: 6000, discountAmount: 30000 }

  it('takes the discount off before taxing', () => {
    // Taxing money the customer never paid overcharges them.
    const totals = calculateOrderTotals(discounted, SALES_TAX)
    expect(totals.taxAmount).toBe(8750) // round(100000 * 0.0875), not 130000
  })

  it('subtracts the discount from the total', () => {
    const totals = calculateOrderTotals(discounted, NONE)
    expect(totals.total).toBe(100000 + 6000)
  })

  it('never lets a discount exceed the subtotal', () => {
    // Otherwise the order pays the customer.
    const totals = calculateOrderTotals(
      { subtotal: 1000, shippingCost: 500, discountAmount: 99999 },
      NONE,
    )
    expect(totals.discountAmount).toBe(1000)
    expect(totals.total).toBe(500)
    expect(totals.total).toBeGreaterThanOrEqual(0)
  })
})

describe('money stays in integer minor units', () => {
  it('never returns a fractional amount', () => {
    for (const rate of [1, 250, 750, 875, 1234, 2000]) {
      for (const subtotal of [1, 99, 12345, 130000, 999999]) {
        for (const mode of ['inclusive', 'exclusive'] as const) {
          const totals = calculateOrderTotals(
            { subtotal, shippingCost: 6000 },
            { mode, rateBasisPoints: rate, label: 'Tax', appliesToShipping: false },
          )
          for (const value of Object.values(totals)) {
            expect(Number.isInteger(value)).toBe(true)
          }
        }
      }
    }
  })

  it('refuses a fractional or negative input rather than rounding it away', () => {
    expect(() => calculateOrderTotals({ subtotal: 100.5, shippingCost: 0 }, NONE)).toThrow()
    expect(() => calculateOrderTotals({ subtotal: -1, shippingCost: 0 }, NONE)).toThrow()
  })

  it('handles a zero-decimal currency, where every unit is whole', () => {
    // 1999 yen at 10%: nothing here assumes a hundredth exists.
    const totals = calculateOrderTotals(
      { subtotal: 1999, shippingCost: 500 },
      { mode: 'exclusive', rateBasisPoints: 1000, label: 'Tax', appliesToShipping: false },
    )
    expect(totals.taxAmount).toBe(200)
    expect(totals.total).toBe(2699)
  })
})

describe('what the customer is shown', () => {
  it('shows no tax line when there is no tax', () => {
    expect(showsTaxLine(NONE, 0)).toBe(false)
    expect(showsTaxLine(VAT_INCLUSIVE, 0)).toBe(false)
  })

  it('shows a tax line when tax applies', () => {
    expect(showsTaxLine(VAT_INCLUSIVE, 9070)).toBe(true)
    expect(showsTaxLine(SALES_TAX, 11375)).toBe(true)
  })

  it('puts the rate next to the amount so a total can be checked', () => {
    expect(taxLineLabel(VAT_INCLUSIVE)).toBe('VAT (7.5%)')
    expect(taxLineLabel(SALES_TAX)).toBe('Sales tax (8.75%)')
    expect(taxLineLabel({ ...SALES_TAX, rateBasisPoints: 2000 })).toBe('Sales tax (20%)')
  })
})
