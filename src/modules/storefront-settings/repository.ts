import 'server-only'

import { eq } from 'drizzle-orm'

import { safeBrandAssetUrl } from '@/lib/brand-asset'
import { db } from '@/lib/db'

import {
  DEFAULT_STOREFRONT_SETTINGS,
  STOREFRONT_SETTINGS_ID,
  type StorefrontSettingsValues,
} from './defaults'
import { storefrontSettings } from './schema'
import type { StorefrontSettingsInput } from './validators'

export async function getStorefrontSettings(): Promise<StorefrontSettingsValues> {
  const [row] = await db
    .select()
    .from(storefrontSettings)
    .where(eq(storefrontSettings.id, STOREFRONT_SETTINGS_ID))
    .limit(1)

  if (!row) return { ...DEFAULT_STOREFRONT_SETTINGS }

  return {
    announcementEnabled: row.announcementEnabled,
    announcementDeliveryText: row.announcementDeliveryText,
    announcementOfferText: row.announcementOfferText,
    heroEnabled: row.heroEnabled,
    heroTitle: row.heroTitle,
    heroDescription: row.heroDescription,
    heroPrimaryLabel: row.heroPrimaryLabel,
    heroPrimaryHref: row.heroPrimaryHref,
    heroSecondaryLabel: row.heroSecondaryLabel,
    heroSecondaryHref: row.heroSecondaryHref,
    heroBrandText: row.heroBrandText,
    heroBrandAccent: row.heroBrandAccent,
    footerBrandText: row.footerBrandText,
    footerBrandAccent: row.footerBrandAccent,
    footerDescription: row.footerDescription,
    footerCopyright: row.footerCopyright,
    // Sanitised on read as well as on write: a value stored before the
    // validation existed, or written by anything other than the Admin form,
    // must not reach an img or link tag unchecked.
    logoUrl: safeBrandAssetUrl(row.logoUrl),
    faviconUrl: safeBrandAssetUrl(row.faviconUrl),
  }
}

export async function upsertStorefrontSettings(input: StorefrontSettingsInput) {
  const [row] = await db
    .insert(storefrontSettings)
    .values({ id: STOREFRONT_SETTINGS_ID, ...input })
    .onConflictDoUpdate({
      target: storefrontSettings.id,
      set: { ...input, updatedAt: new Date() },
    })
    .returning()

  if (!row) throw new Error('Storefront settings update returned no row')
  return row
}
