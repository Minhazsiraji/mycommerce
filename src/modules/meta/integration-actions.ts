'use server'

import { refresh, updateTag } from 'next/cache'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import { META_INTEGRATION_CACHE_TAG } from './cached'
import { saveMetaIntegration, testMetaConnection } from './integration'
import { metaIntegrationInputSchema } from './validators'

export async function updateMetaIntegration(input: unknown): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')
  const parsed = metaIntegrationInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await saveMetaIntegration(parsed.data)
  await recordAudit(admin, {
    action: 'integration.meta.updated',
    entityType: 'integration',
    entityId: 'meta',
    detail: {
      enabled: parsed.data.enabled,
      pixelConfigured: Boolean(parsed.data.pixelId),
      datasetConfigured: Boolean(parsed.data.datasetId),
      accessTokenChanged: Boolean(parsed.data.accessToken),
      accessTokenCleared: parsed.data.clearAccessToken,
      testEventCodeConfigured: Boolean(parsed.data.testEventCode),
      domainVerificationConfigured: Boolean(parsed.data.domainVerificationCode),
    },
  })

  updateTag(META_INTEGRATION_CACHE_TAG)
  refresh()
  return ok(null)
}

export async function testMetaIntegration(): Promise<ActionResult<{ message: string }>> {
  const admin = await requireRole('admin')
  const result = await testMetaConnection()
  await recordAudit(admin, {
    action: 'integration.meta.tested',
    entityType: 'integration',
    entityId: 'meta',
    detail: { result: result.ok ? 'ok' : 'error' },
  })

  if (!result.ok) return fail('unavailable', result.message)
  refresh()
  return ok({ message: result.message })
}
