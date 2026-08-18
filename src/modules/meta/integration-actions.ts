'use server'

import { createHash } from 'node:crypto'
import { refresh } from 'next/cache'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { clientEnv, env } from '@/lib/env'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import {
  buildMetaConnectionTestPayload,
  formatMetaConnectionError,
  metaConnectionTestConfigError,
  sanitizeMetaError,
} from './connection-test'
import { getEffectiveMetaConfig } from './integration-config'
import { encryptIntegrationSecret, integrationEncryptionReady } from './integration-crypto'
import * as repo from './repository'
import { metaIntegrationInputSchema } from './validators'

const emptyToNull = (value: string) => value.trim() || null

export async function saveMetaIntegration(input: unknown): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')
  const parsed = metaIntegrationInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  const data = parsed.data
  const existing = await repo.getMetaIntegrationSettings()

  let encryptedToken = existing?.accessTokenEncrypted ?? null
  let tokenChanged = false

  if (data.clearAccessToken) {
    encryptedToken = null
    tokenChanged = Boolean(existing?.accessTokenEncrypted)
  } else if (data.accessToken) {
    if (data.accessToken.length < 20) {
      return fail('validation', 'Please correct the highlighted fields.', {
        accessToken: 'The Meta CAPI token appears too short.',
      })
    }
    if (!integrationEncryptionReady()) {
      return fail(
        'unavailable',
        'Secret encryption is not configured for this deployment. Add INTEGRATIONS_ENCRYPTION_KEY first.',
      )
    }
    encryptedToken = encryptIntegrationSecret(data.accessToken)
    tokenChanged = true
  }

  const datasetId = emptyToNull(data.datasetId)
  if (datasetId && !encryptedToken) {
    return fail('validation', 'Please correct the highlighted fields.', {
      accessToken: 'Store a CAPI access token with the Dataset ID.',
    })
  }
  if (!datasetId && encryptedToken) {
    return fail('validation', 'Please correct the highlighted fields.', {
      datasetId: 'Dataset ID is required while a CAPI token is stored.',
    })
  }

  await repo.saveMetaIntegrationSettings({
    trackingEnabled: data.trackingEnabled,
    pixelId: emptyToNull(data.pixelId),
    datasetId,
    accessTokenEncrypted: encryptedToken,
    testEventCode: emptyToNull(data.testEventCode),
    domainVerification: emptyToNull(data.domainVerification),
  })

  await recordAudit(admin, {
    action: 'meta_integration.updated',
    entityType: 'meta_integration',
    entityId: repo.META_STORE_KEY,
    detail: {
      trackingEnabled: data.trackingEnabled,
      pixelId: emptyToNull(data.pixelId),
      datasetId,
      testEventCodeConfigured: Boolean(data.testEventCode),
      domainVerificationConfigured: Boolean(data.domainVerification),
      tokenChanged,
      tokenCleared: data.clearAccessToken,
    },
  })

  refresh()
  return ok(null)
}

export async function testMetaConnection(): Promise<ActionResult<{ message: string }>> {
  const admin = await requireRole('admin')
  const config = await getEffectiveMetaConfig()
  const configError = metaConnectionTestConfigError(config)

  if (configError) {
    const category = !config.testEventCode && config.enabled && config.datasetId && config.accessToken
      ? 'validation'
      : 'unavailable'
    return fail(category, configError)
  }

  const datasetId = config.datasetId!
  const accessToken = config.accessToken!
  const testEventCode = config.testEventCode!
  const sourceUrl = `${clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/__meta-connection-test`
  const syntheticExternalIdHash = createHash('sha256')
    .update('meta-capi-admin-connection-test')
    .digest('hex')
  const payload = buildMetaConnectionTestPayload({
    testEventCode,
    eventSourceUrl: sourceUrl,
    syntheticExternalIdHash,
  })

  try {
    const response = await fetch(
      `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${encodeURIComponent(datasetId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
        signal: AbortSignal.timeout(8_000),
      },
    )

    if (!response.ok) {
      let rawError: unknown
      try {
        rawError = await response.json()
      } catch {
        rawError = undefined
      }
      const metaError = sanitizeMetaError(rawError, accessToken)
      const message = formatMetaConnectionError({ httpStatus: response.status, metaError })
      await repo.recordMetaConnectionTest('error', message)
      await recordAudit(admin, {
        action: 'meta_integration.connection_tested',
        entityType: 'meta_integration',
        entityId: repo.META_STORE_KEY,
        detail: {
          result: 'error',
          httpStatus: response.status,
          metaCode: metaError.code,
          metaSubcode: metaError.subcode,
          metaType: metaError.type,
        },
      })
      refresh()
      return fail('unavailable', message)
    }

    const message = 'Meta server connection succeeded with a Test Events CAPI event.'
    await repo.recordMetaConnectionTest('ok', message)
    await recordAudit(admin, {
      action: 'meta_integration.connection_tested',
      entityType: 'meta_integration',
      entityId: repo.META_STORE_KEY,
      detail: { result: 'ok', mode: 'test_event' },
    })
    refresh()
    return ok({ message })
  } catch {
    const message = 'Meta connection test could not reach the Graph API. Try again shortly.'
    await repo.recordMetaConnectionTest('error', message)
    refresh()
    return fail('unavailable', message)
  }
}
