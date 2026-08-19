import type { Metadata } from 'next'
import { connection } from 'next/server'

import { getGoogleAdminState, googleAdminFormDefaults } from '@/modules/google'
import { GoogleIntegrationForm } from '@/modules/google/components/google-integration-form'

export const metadata: Metadata = { title: 'Google integration' }

export default async function GoogleIntegrationPage() {
  await connection()

  const state = await getGoogleAdminState()
  const settings = state.settings

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-(--color-muted)">Integrations</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Google</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--color-muted)">
          Manage the Google tag and purchase measurement for this store without hard-coding SirajiBD or any client identity into the application. Existing Vercel configuration can remain as a fallback until Admin-managed settings take over.
        </p>
      </div>

      <GoogleIntegrationForm
        initial={googleAdminFormDefaults(settings, state.effective)}
        status={state.effective}
      />
    </div>
  )
}
