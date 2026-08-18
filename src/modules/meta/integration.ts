import 'server-only'

import { clientEnv, env } from '@/lib/env'

import { decryptCredential, encryptCredential } from './encryption'
import * as repo from './repository'

export type MetaRuntimeConfig = {
  enabled: boolean
  pixelId: string | null
  datasetId: string | null
  accessToken: string | null
  testEventCode: string | null
  domainVerificationCode: string | null
  source: 'database' | 'environment'
}

const clean = (value: string | null | undefined) => value?.trim() || null

export async function resolveMetaRuntimeConfig(): Promise<MetaRuntimeConfig> {
  const row = await repo.getIntegrationSettings()

  if (!row) {
    const pixelId = clean(clientEnv.NEXT_PUBLIC_META_PIXEL_ID)
    const datasetId = clean(env.META_CAPI_DATASET_ID)
    const accessToken = clean(env.META_CAPI_ACCESS_TOKEN)
    return {
      enabled: Boolean(pixelId || (datasetId && accessToken)),
      pixelId,
      datasetId,
      accessToken,
      testEventCode: clean(env.META_CAPI_TEST_EVENT_CODE),
      domainVerificationCode: null,
      source: 'environment',
    }
  }

  let storedToken: string | null = null
  if (row.accessTokenEncrypted) {
    try {
      storedToken = decryptCredential(row.accessTokenEncrypted)
    } catch (error) {
      console.error('[meta] unable to decrypt stored credential', error instanceof Error ? error.message : 'unknown error')
    }
  }

  return {
    enabled: row.enabled,
    pixelId: clean(row.pixelId) ?? clean(clientEnv.NEXT_PUBLIC_META_PIXEL_ID),
    datasetId: clean(row.datasetId) ?? clean(env.META_CAPI_DATASET_ID),
    accessToken: clean(storedToken) ?? clean(env.META_CAPI_ACCESS_TOKEN),
    testEventCode: clean(row.testEventCode) ?? clean(env.META_CAPI_TEST_EVENT_CODE),
    domainVerificationCode: clean(row.domainVerificationCode),
    source: 'database',
  }
}

export async function getMetaPublicConfig() {
  const config = await resolveMetaRuntimeConfig()
  return {
    enabled: config.enabled,
    pixelId: config.pixelId,
    domainVerificationCode: config.domainVerificationCode,
    browserConfigured: Boolean(config.pixelId),
    serverConfigured: Boolean(config.datasetId && config.accessToken),
    source: config.source,
  }
}

export async function getMetaAdminState() {
  const [row, config, deliveries] = await Promise.all([
    repo.getIntegrationSettings(),
    resolveMetaRuntimeConfig(),
    repo.listRecentDeliveryHealth(),
  ])

  const sent = deliveries.filter((item) => item.status === 'sent').length
  const failed = deliveries.filter((item) => item.status === 'failed').length
  const pending = deliveries.filter((item) => item.status === 'pending' || item.status === 'sending').length
  const lastDelivery = deliveries.find((item) => item.status === 'sent')

  return {
    enabled: config.enabled,
    pixelId: row?.pixelId ?? config.pixelId ?? '',
    datasetId: row?.datasetId ?? config.datasetId ?? '',
    accessTokenConfigured: Boolean(config.accessToken),
    accessTokenStored: Boolean(row?.accessTokenEncrypted),
    testEventCode: row?.testEventCode ?? config.testEventCode ?? '',
    domainVerificationCode: row?.domainVerificationCode ?? '',
    source: config.source,
    browserConfigured: Boolean(config.pixelId),
    serverConfigured: Boolean(config.datasetId && config.accessToken),
    lastTestStatus: row?.lastTestStatus ?? null,
    lastTestMessage: row?.lastTestMessage ?? null,
    lastTestedAt: row?.lastTestedAt ?? null,
    lastSuccessfulEventName: row?.lastSuccessfulEventName ?? lastDelivery?.eventName ?? null,
    lastSuccessfulEventAt: row?.lastSuccessfulEventAt ?? lastDelivery?.sentAt ?? null,
    health: { sent, failed, pending, sampleSize: deliveries.length },
  }
}

export async function saveMetaIntegration(input: {
  enabled: boolean
  pixelId: string
  datasetId: string
  accessToken?: string
  clearAccessToken?: boolean
  testEventCode: string
  domainVerificationCode: string
}) {
  const token = clean(input.accessToken)
  const encrypted = input.clearAccessToken ? null : token ? encryptCredential(token) : undefined

  return repo.upsertIntegrationSettings({
    enabled: input.enabled,
    pixelId: clean(input.pixelId),
    datasetId: clean(input.datasetId),
    accessTokenEncrypted: encrypted,
    testEventCode: clean(input.testEventCode),
    domainVerificationCode: clean(input.domainVerificationCode),
  })
}

export async function testMetaConnection() {
  const config = await resolveMetaRuntimeConfig()
  if (!config.enabled) return { ok: false as const, message: 'Meta tracking is turned off.' }
  if (!config.datasetId || !config.accessToken) {
    return { ok: false as const, message: 'Dataset ID and CAPI access token are required.' }
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${encodeURIComponent(config.datasetId)}?fields=id,name`,
      {
        headers: { Authorization: `Bearer ${config.accessToken}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(5_000),
      },
    )
    if (!response.ok) {
      const body = (await response.text()).slice(0, 180)
      const message = `Meta returned ${response.status}${body ? `: ${body}` : ''}`
      await repo.recordConnectionTest('error', message)
      return { ok: false as const, message }
    }

    await repo.recordConnectionTest('ok', 'Meta accepted the dataset and access token.')
    return { ok: true as const, message: 'Meta accepted the dataset and access token.' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to contact Meta.'
    await repo.recordConnectionTest('error', message)
    return { ok: false as const, message }
  }
}
