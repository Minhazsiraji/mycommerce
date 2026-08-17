'use server'

import { refresh, updateTag } from 'next/cache'

import { fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import { upsertStorefrontSettings } from './repository'
import { STOREFRONT_SETTINGS_TAGS } from './tags'
import { storefrontSettingsInputSchema } from './validators'

export async function updateStorefrontSettings(input: unknown): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')

  const parsed = storefrontSettingsInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await upsertStorefrontSettings(parsed.data)
  await recordAudit(admin, {
    action: 'storefront_settings.updated',
    entityType: 'storefront_settings',
    entityId: 'default',
    detail: parsed.data,
  })

  updateTag(STOREFRONT_SETTINGS_TAGS.settings)
  refresh()
  return ok(null)
}
