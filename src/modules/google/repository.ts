import 'server-only'

import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { googleIntegrationSettings } from '@/lib/db/schema'

export const GOOGLE_STORE_KEY = 'default'

export function getGoogleIntegrationSettings() {
  return db.query.googleIntegrationSettings.findFirst({
    where: eq(googleIntegrationSettings.storeKey, GOOGLE_STORE_KEY),
  })
}

export async function saveGoogleIntegrationSettings(input: {
  trackingEnabled: boolean
  tagId: string | null
  purchaseTrackingEnabled: boolean
}) {
  const now = new Date()
  const [row] = await db
    .insert(googleIntegrationSettings)
    .values({ storeKey: GOOGLE_STORE_KEY, ...input, updatedAt: now })
    .onConflictDoUpdate({
      target: googleIntegrationSettings.storeKey,
      set: { ...input, updatedAt: now },
    })
    .returning()

  return row
}
