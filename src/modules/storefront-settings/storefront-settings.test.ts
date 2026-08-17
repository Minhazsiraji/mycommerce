import { describe, expect, it } from 'vitest'

import { DEFAULT_STOREFRONT_SETTINGS } from './defaults'
import { storefrontSettingsInputSchema } from './validators'

const validInput = {
  ...DEFAULT_STOREFRONT_SETTINGS,
  announcementDeliveryText: '',
  announcementOfferText: '',
}

describe('storefrontSettingsInputSchema', () => {
  it('normalizes empty announcement overrides to automatic values', () => {
    const parsed = storefrontSettingsInputSchema.parse(validInput)

    expect(parsed.announcementDeliveryText).toBeNull()
    expect(parsed.announcementOfferText).toBeNull()
  })

  it.each(['/search', '/c/apparel?sort=price-asc', '#categories'])(
    'allows safe internal destination %s',
    (destination) => {
      expect(
        storefrontSettingsInputSchema.safeParse({
          ...validInput,
          heroPrimaryHref: destination,
        }).success,
      ).toBe(true)
    },
  )

  it.each(['https://example.com', '//example.com', 'javascript:alert(1)', 'categories'])(
    'rejects unsafe or external destination %s',
    (destination) => {
      expect(
        storefrontSettingsInputSchema.safeParse({
          ...validInput,
          heroPrimaryHref: destination,
        }).success,
      ).toBe(false)
    },
  )

  it('requires meaningful hero copy even when the section is currently hidden', () => {
    const result = storefrontSettingsInputSchema.safeParse({
      ...validInput,
      heroEnabled: false,
      heroTitle: '',
    })

    expect(result.success).toBe(false)
  })

  it('requires meaningful footer copy and allows an empty accent', () => {
    expect(
      storefrontSettingsInputSchema.safeParse({
        ...validInput,
        footerBrandAccent: '',
        footerCopyright: '© @AgentSiraji',
      }).success,
    ).toBe(true)

    expect(
      storefrontSettingsInputSchema.safeParse({
        ...validInput,
        footerDescription: '',
      }).success,
    ).toBe(false)
  })
})
