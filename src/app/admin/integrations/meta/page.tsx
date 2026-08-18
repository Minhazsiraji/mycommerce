import type { Metadata } from 'next'
import { connection } from 'next/server'

import { getMetaAdminState } from '@/modules/meta'
import { MetaIntegrationSettingsForm } from '@/modules/meta/components/integration-settings-form'

export const metadata: Metadata = { title: 'Meta integration' }

const formatDate = (value: Date | null) => (value ? value.toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' }) : null)

export default async function MetaIntegrationPage() {
  // This page reads encrypted integration state from Postgres. Force the read to
  // request time so CI/static builds do not require a live DATABASE_URL.
  await connection()
  const state = await getMetaAdminState()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-(--color-muted)">Integrations → Meta</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Meta Pixel & Conversions API</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--color-muted)">
          Configure browser and server-side tracking per store. Environment variables remain a fallback for existing deployments, while saved credentials are encrypted at rest.
        </p>
      </div>

      <MetaIntegrationSettingsForm
        initial={{
          ...state,
          lastTestedAt: formatDate(state.lastTestedAt),
          lastSuccessfulEventAt: formatDate(state.lastSuccessfulEventAt),
        }}
      />
    </div>
  )
}
