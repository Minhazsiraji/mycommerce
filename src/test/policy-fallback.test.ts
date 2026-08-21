import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The bundled policy text must be a generic template.
 *
 * A client can replace every policy page from Admin, and production requires
 * `STORE_POLICIES_REVIEWED` before it will boot. But an attestation is only
 * meaningful if what it attests to is safe when unreviewed — a store owner
 * ticking a box should not thereby publish a claim that their business is
 * governed by another country's consumer-protection law.
 *
 * Jurisdiction and coverage follow STORE_COUNTRY_NAME. Currency and store name
 * follow their own configuration. Nothing here may be a literal.
 */
const POLICY_PAGES = ['terms', 'privacy', 'returns', 'shipping', 'about', 'contact']

const source = (page: string) =>
  readFileSync(path.join(process.cwd(), 'src', 'app', '(shop)', page, 'page.tsx'), 'utf8')

/** Comments describe intent and never reach a customer. */
function shippedText(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

describe.each(POLICY_PAGES)('the bundled %s template', (page) => {
  it('names no specific country', () => {
    // "…governed by the laws of Bangladesh" on a US store's Terms is a false
    // statement about that business, published to its customers.
    expect(shippedText(source(page))).not.toMatch(/Bangladesh/)
  })

  it('names no specific city or dialling code', () => {
    const text = shippedText(source(page))
    expect(text).not.toMatch(/Dhaka/)
    expect(text).not.toMatch(/\+880/)
  })

  it('names no specific currency', () => {
    const text = shippedText(source(page))
    expect(text).not.toMatch(/BDT/)
    expect(text).not.toMatch(/৳/)
  })

  it('names no specific business', () => {
    expect(shippedText(source(page))).not.toMatch(/sirajibd/i)
  })
})

describe('what the template still commits the store to', () => {
  /**
   * These are business decisions the template guesses at. They are deliberately
   * left in — an empty returns policy is worse than a stated one — but they are
   * the reason `STORE_POLICIES_REVIEWED` exists, and this test records exactly
   * what a store owner is agreeing to when they set it.
   */
  it('states a return window and a refund timescale a client must confirm', () => {
    const returns = shippedText(source('returns'))

    expect(returns).toMatch(/7 calendar days/)
    expect(returns).toMatch(/5–7 business days/)
  })

  it('keeps those commitments in one page, so review has a clear scope', () => {
    for (const page of ['terms', 'privacy', 'shipping']) {
      expect(shippedText(source(page))).not.toMatch(/7 calendar days/)
    }
  })
})
