import type { Metadata } from 'next'

import { getMetaAdminState } from '@/modules/meta'
import { MetaIntegrationForm } from '@/modules/meta/components/meta-integration-form'

export const metadata: Metadata = { title: 'Meta integration' }

const iso = (value: Date | null | undefined) => value ? value.toISOString() : null

export default async function MetaIntegrationPage() {
  const state = await getMetaAdminState()
  const settings = state.settings

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-(--color-muted)">Integrations</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Meta</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--color-muted)">
          Manage Meta Pixel and Conversions API for this store without exposing server credentials to the browser. Existing Vercel variables remain available as a fallback until you intentionally move the store to Admin-managed settings.
        </p>
      </div>

      <MetaIntegrationForm
        initial={{
          trackingEnabled: settings?.trackingEnabled ?? state.effective.enabled,
          pixelId: settings?.pixelId ?? '',
          datasetId: settings?.datasetId ?? '',
          tokenStored: settings?.tokenStored ?? false,
          testEventCode: settings?.testEventCode ?? '',
          domainVerification: settings?.domainVerification ?? '',
        }}
        status={{
          source: state.effective.source,
          enabled: state.effective.enabled,
          browserPixelConfigured: state.effective.browserPixelConfigured,
          serverCapiConfigured: state.effective.serverCapiConfigured,
          encryptionReady: state.effective.encryptionReady,
          envFallbackAvailable: state.effective.envFallbackAvailable,
          lastConnectionTestAt: iso(settings?.lastConnectionTestAt),
          lastConnectionStatus: settings?.lastConnectionStatus ?? null,
          lastConnectionMessage: settings?.lastConnectionMessage ?? null,
          lastSuccessfulEventAt: iso(settings?.lastSuccessfulEventAt),
          lastSuccessfulEventName: settings?.lastSuccessfulEventName ?? null,
        }}
        health={{
          sent: state.health.sent,
          failed: state.health.failed,
          pending: state.health.pending,
          recent: state.health.recent.map((row) => ({
            eventName: row.eventName,
            status: row.status,
            attempts: row.attempts,
            createdAt: row.createdAt.toISOString(),
            sentAt: iso(row.sentAt),
            lastError: row.lastError,
          })),
        }}
      />
    </div>
  )
}
