'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'

import { fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import * as repo from './repository'

const googleIntegrationInputSchema = z.object({
  trackingEnabled: z.boolean(),
  tagId: z.string().trim().max(80),
  purchaseTrackingEnabled: z.boolean(),
})

const GOOGLE_TAG_PATTERN = /^(GT|G|AW)-[A-Z0-9-]+$/i

export async function saveGoogleIntegration(input: unknown): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')
  const parsed = googleIntegrationInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  const data = parsed.data
  const tagId = data.tagId.trim() || null

  if (tagId && !GOOGLE_TAG_PATTERN.test(tagId)) {
    return {
      ok: false,
      error: {
        category: 'validation',
        message: 'Please correct the highlighted fields.',
        fields: { tagId: 'Use a valid Google tag ID such as GT-XXXX, G-XXXX or AW-XXXX.' },
      },
    }
  }

  await repo.saveGoogleIntegrationSettings({
    trackingEnabled: data.trackingEnabled,
    tagId,
    purchaseTrackingEnabled: data.purchaseTrackingEnabled,
  })

  await recordAudit(admin, {
    action: 'google_integration.updated',
    entityType: 'google_integration',
    entityId: repo.GOOGLE_STORE_KEY,
    detail: {
      trackingEnabled: data.trackingEnabled,
      tagId,
      purchaseTrackingEnabled: data.purchaseTrackingEnabled,
    },
  })

  refresh()
  return ok(null)
}
