import 'server-only'

import { clientEnv } from '@/lib/env'

import * as repo from './repository'

export type EffectiveGoogleConfig = {
  enabled: boolean
  source: 'admin' | 'env' | 'disabled'
  tagId?: string
  purchaseTrackingEnabled: boolean
}

export async function getEffectiveGoogleConfig(): Promise<EffectiveGoogleConfig> {
  const settings = await repo.getGoogleIntegrationSettings()

  if (!settings) {
    const tagId = clientEnv.NEXT_PUBLIC_GOOGLE_TAG_ID
    const enabled = Boolean(tagId)
    return {
      enabled,
      source: enabled ? 'env' : 'disabled',
      tagId,
      purchaseTrackingEnabled: enabled,
    }
  }

  if (!settings.trackingEnabled) {
    return {
      enabled: false,
      source: 'disabled',
      purchaseTrackingEnabled: false,
    }
  }

  const tagId = settings.tagId ?? clientEnv.NEXT_PUBLIC_GOOGLE_TAG_ID
  return {
    enabled: Boolean(tagId),
    source: 'admin',
    tagId: tagId ?? undefined,
    purchaseTrackingEnabled: Boolean(tagId && settings.purchaseTrackingEnabled),
  }
}

export async function getGoogleAdminState() {
  const [settings, effective] = await Promise.all([
    repo.getGoogleIntegrationSettings(),
    getEffectiveGoogleConfig(),
  ])

  return {
    settings: settings
      ? {
          trackingEnabled: settings.trackingEnabled,
          tagId: settings.tagId ?? '',
          purchaseTrackingEnabled: settings.purchaseTrackingEnabled,
        }
      : null,
    effective: {
      enabled: effective.enabled,
      source: effective.source,
      tagConfigured: Boolean(effective.tagId),
      purchaseTrackingEnabled: effective.purchaseTrackingEnabled,
      envFallbackAvailable: Boolean(clientEnv.NEXT_PUBLIC_GOOGLE_TAG_ID),
    },
  }
}
