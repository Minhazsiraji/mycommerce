import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  DEFAULT_POLICY_SETTINGS,
  refundProcessingText,
  returnWindowText,
} from './settings-defaults'
import { policySettingsInputSchema } from './validators'

/**
 * Return windows and refund timescales are commercial terms, not software
 * behaviour. They were prose in the bundled Returns page — "within 7 calendar
 * days", "5–7 business days" — which made one retailer's policy the promise
 * every clone's customers read.
 */
describe('another store sets its own periods, without touching source', () => {
  it.each([
    [14, '14 calendar days'],
    [30, '30 calendar days'],
    [1, '1 calendar day'],
    [0, '0 calendar days'],
  ])('renders a %s-day window', (days, expected) => {
    expect(returnWindowText({ ...DEFAULT_POLICY_SETTINGS, returnWindowDays: days })).toBe(expected)
  })

  it.each([
    [2, 5, '2–5 business days'],
    [10, 21, '10–21 business days'],
    [3, 3, '3 business days'],
    [1, 1, '1 business day'],
  ])('renders a %s–%s day refund time', (min, max, expected) => {
    expect(
      refundProcessingText({
        ...DEFAULT_POLICY_SETTINGS,
        refundProcessingMinDays: min,
        refundProcessingMaxDays: max,
      }),
    ).toBe(expected)
  })

  it('lets the original store keep its own terms through configuration', () => {
    // SirajiBD's 7 days / 5–7 business days is now a stored setting like any
    // other client's, reached the same way.
    const configured = {
      returnWindowDays: 7,
      refundProcessingMinDays: 5,
      refundProcessingMaxDays: 7,
    }

    expect(returnWindowText(configured)).toBe('7 calendar days')
    expect(refundProcessingText(configured)).toBe('5–7 business days')
  })
})

describe('the generic fallback commits the store to nothing', () => {
  it('states no period when none is configured', () => {
    expect(returnWindowText(DEFAULT_POLICY_SETTINGS)).toBeNull()
    expect(refundProcessingText(DEFAULT_POLICY_SETTINGS)).toBeNull()
  })

  it("does not fall back to the original store's periods", () => {
    // A default of 7 would still be this software promising a return window on
    // behalf of a business that never chose one.
    expect(DEFAULT_POLICY_SETTINGS.returnWindowDays).toBeNull()
    expect(DEFAULT_POLICY_SETTINGS.refundProcessingMinDays).toBeNull()
    expect(DEFAULT_POLICY_SETTINGS.refundProcessingMaxDays).toBeNull()
  })

  it('keeps no period literal in the bundled Returns page', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'src', 'app', '(shop)', 'returns', 'page.tsx'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '')

    expect(source).not.toMatch(/7 calendar days/)
    expect(source).not.toMatch(/5–7 business days/)
    expect(source).not.toMatch(/7-day/)
  })

  it('tolerates a half-configured range rather than rendering nonsense', () => {
    // Only one bound set: treat it as a single figure, never "5–null".
    expect(
      refundProcessingText({ ...DEFAULT_POLICY_SETTINGS, refundProcessingMinDays: 5 }),
    ).toBe('5 business days')
    expect(
      refundProcessingText({ ...DEFAULT_POLICY_SETTINGS, refundProcessingMaxDays: 9 }),
    ).toBe('9 business days')
  })
})

describe('what an admin may enter', () => {
  it('accepts empty fields as "not stated"', () => {
    const parsed = policySettingsInputSchema.parse({
      returnWindowDays: '',
      refundProcessingMinDays: '',
      refundProcessingMaxDays: '',
    })

    expect(parsed).toEqual({
      returnWindowDays: null,
      refundProcessingMinDays: null,
      refundProcessingMaxDays: null,
    })
  })

  it('accepts numbers typed as strings, which is what a form sends', () => {
    expect(policySettingsInputSchema.parse({ returnWindowDays: '14' }).returnWindowDays).toBe(14)
  })

  it('keeps zero distinct from empty', () => {
    // A same-day-only return policy is a real policy; it must not read as unset.
    expect(policySettingsInputSchema.parse({ returnWindowDays: '0' }).returnWindowDays).toBe(0)
  })

  it.each(['-1', '400', '7.5', 'soon'])('rejects %s', (value) => {
    expect(() => policySettingsInputSchema.parse({ returnWindowDays: value })).toThrow()
  })

  it('rejects a refund range that runs backwards', () => {
    expect(() =>
      policySettingsInputSchema.parse({
        refundProcessingMinDays: '10',
        refundProcessingMaxDays: '3',
      }),
    ).toThrow()
  })
})
