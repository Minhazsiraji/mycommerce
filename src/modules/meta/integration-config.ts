import 'server-only'

import { clientEnv, env } from '@/lib/env'

import { decryptIntegrationSecret, integrationEncryptionReady } from './integration-crypto'
import * as repo from './repository'

export type EffectiveMetaConfig = {
  enabled: boolean
  source: 'admin' | 'env' | 'disabled'
  pixelId?: string
  datasetId?: string
  accessToken?: string
  testEventCode?: string
  domainVerification?: string
}

export async function getEffectiveMetaConfig(): Promise<EffectiveMetaConfig> {
  const settings = await repo.getMetaIntegrationSettings()

  if (!settings) {
    const enabled = Boolean(
      clientEnv.NEXT_PUBLIC_META_PIXEL_ID ||
        (env.META_CAPI_DATASET_ID && env.META_CAPI_ACCESS_TOKEN),
    )
    return {
      enabled,
      source: enabled ? 'env' : 'disabled',
      pixelId: clientEnv.NEXT_PUBLIC_META_PIXEL_ID,
      datasetId: env.META_CAPI_DATASET_ID,
      accessToken: env.META_CAPI_ACCESS_TOKEN,
      testEventCode: env.META_CAPI_TEST_EVENT_CODE,
    }
  }

  if (!settings.trackingEnabled) {
    return {
      enabled: false,
      source: 'disabled',
      domainVerification: settings.domainVerification ?? undefined,
    }
  }

  let adminToken: string | undefined
  if (settings.accessTokenEncrypted) {
    try {
      adminToken = decryptIntegrationSecret(settings.accessTokenEncrypted)
    } catch {
      // Keep the store operational if a key is missing/rotated incorrectly.
      // The admin health screen exposes the fallback state; no secret is logged.
      adminToken = undefined
    }
  }

  const hasAdminServerPair = Boolean(settings.datasetId && adminToken)

  return {
    enabled: true,
    source: 'admin',
    pixelId: settings.pixelId ?? clientEnv.NEXT_PUBLIC_META_PIXEL_ID,
    datasetId: hasAdminServerPair ? settings.datasetId ?? undefined : env.META_CAPI_DATASET_ID,
    accessToken: hasAdminServerPair ? adminToken : env.META_CAPI_ACCESS_TOKEN,
    testEventCode: settings.testEventCode ?? env.META_CAPI_TEST_EVENT_CODE,
    domainVerification: settings.domainVerification ?? undefined,
  }
}

export async function getMetaAdminState() {
  const [settings, effective, deliveries] = await Promise.all([
    repo.getMetaIntegrationSettings(),
    getEffectiveMetaConfig(),
    repo.listRecentMetaDeliveries(),
  ])

  const sent = deliveries.filter((row) => row.status === 'sent').length
  const failed = deliveries.filter((row) => row.status === 'failed').length
  const pending = deliveries.filter((row) => ['pending', 'sending'].includes(row.status)).length

  return {
    settings: settings
      ? {
          trackingEnabled: settings.trackingEnabled,
          pixelId: settings.pixelId ?? '',
          datasetId: settings.datasetId ?? '',
          tokenStored: Boolean(settings.accessTokenEncrypted),
          testEventCode: settings.testEventCode ?? '',
          domainVerification: settings.domainVerification ?? '',
          lastConnectionTestAt: settings.lastConnectionTestAt,
          lastConnectionStatus: settings.lastConnectionStatus,
          lastConnectionMessage: settings.lastConnectionMessage,
          lastSuccessfulEventAt: settings.lastSuccessfulEventAt,
          lastSuccessfulEventName: settings.lastSuccessfulEventName,
        }
      : null,
    effective: {
      enabled: effective.enabled,
      source: effective.source,
      browserPixelConfigured: Boolean(effective.pixelId),
      serverCapiConfigured: Boolean(effective.datasetId && effective.accessToken),
      encryptionReady: integrationEncryptionReady(),
      envFallbackAvailable: Boolean(
        clientEnv.NEXT_PUBLIC_META_PIXEL_ID ||
          (env.META_CAPI_DATASET_ID && env.META_CAPI_ACCESS_TOKEN),
      ),
    },
    health: { sent, failed, pending, recent: deliveries },
  }
}
