/**
 * Order totals, including tax.
 *
 * "Prices include tax" was previously an unwritten assumption rather than a
 * setting: `total = subtotal + shipping`, `tax_amount` always zero. That is
 * correct for a Bangladeshi retailer quoting VAT-inclusive prices and wrong for
 * a client whose prices are quoted before tax — and nothing in the software
 * said which one it believed. A store should not have to edit source to say how
 * its own prices work.
 *
 * This is configuration, not tax compliance. It applies one configured rate; it
 * does not know a customer's jurisdiction, nexus, product tax categories or
 * exemptions. Clients remain responsible for their own local tax obligations.
 */

export type TaxMode = 'none' | 'inclusive' | 'exclusive'

export type TaxConfig = {
  mode: TaxMode
  /**
   * Basis points, so the rate is an integer: 750 is 7.5%. A percentage held as
   * a float would reintroduce exactly the rounding error the minor-units rule
   * exists to prevent.
   */
  rateBasisPoints: number
  /** What to call it on the page: "VAT", "GST", "Sales tax". */
  label: string
  /** Some jurisdictions tax delivery, some do not. */
  appliesToShipping: boolean
}

export type OrderTotals = {
  subtotal: number
  discountAmount: number
  shippingCost: number
  taxAmount: number
  total: number
}

const BASIS = 10_000

/**
 * The order of operations, fixed here rather than rediscovered per call site:
 *
 *   subtotal → less discount → plus shipping → tax → total
 *
 * Discount comes off before tax because taxing money the customer never paid
 * overcharges them. Shipping is included in the taxable base only when
 * configured, because jurisdictions genuinely differ.
 */
export function calculateOrderTotals(
  input: { subtotal: number; shippingCost: number; discountAmount?: number },
  tax: TaxConfig,
): OrderTotals {
  const subtotal = requireMinorUnits(input.subtotal, 'subtotal')
  const shippingCost = requireMinorUnits(input.shippingCost, 'shippingCost')
  const discountAmount = requireMinorUnits(input.discountAmount ?? 0, 'discountAmount')

  // A discount can never exceed what is being discounted, or the order pays out.
  const discount = Math.min(discountAmount, subtotal)
  const discounted = subtotal - discount
  const base = tax.appliesToShipping ? discounted + shippingCost : discounted

  if (tax.mode === 'none' || tax.rateBasisPoints === 0) {
    return {
      subtotal,
      discountAmount: discount,
      shippingCost,
      taxAmount: 0,
      total: discounted + shippingCost,
    }
  }

  if (tax.mode === 'inclusive') {
    /**
     * The price already contains the tax, so the total does not move — this is
     * a disclosure, not a charge. Computed by extracting the net rather than
     * multiplying the gross, which is the difference between reporting the tax
     * actually contained and reporting a slightly larger number.
     */
    const net = Math.round((base * BASIS) / (BASIS + tax.rateBasisPoints))
    return {
      subtotal,
      discountAmount: discount,
      shippingCost,
      taxAmount: base - net,
      total: discounted + shippingCost,
    }
  }

  const taxAmount = Math.round((base * tax.rateBasisPoints) / BASIS)
  return {
    subtotal,
    discountAmount: discount,
    shippingCost,
    taxAmount,
    total: discounted + shippingCost + taxAmount,
  }
}

function requireMinorUnits(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer in minor units, received ${value}`)
  }
  return value
}

/** Whether a tax line should appear at all. */
export function showsTaxLine(tax: TaxConfig, taxAmount: number): boolean {
  return tax.mode !== 'none' && taxAmount > 0
}

/** "VAT (7.5%)" — the rate belongs next to the amount so a total can be checked. */
export function taxLineLabel(tax: TaxConfig): string {
  // Trailing zeros trimmed: 7.5% not 7.50%, 20% not 20.00%.
  const percent = String(tax.rateBasisPoints / 100)
  return `${tax.label} (${percent}%)`
}
