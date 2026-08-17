import type { Metadata } from 'next'
import { connection } from 'next/server'

import { getStorefrontSettings } from '@/modules/storefront-settings'
import { HomepageSettingsForm } from '@/modules/storefront-settings/components/homepage-settings-form'

export const metadata: Metadata = { title: 'Homepage' }

export default async function AdminHomepagePage() {
  await connection()
  const settings = await getStorefrontSettings()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Homepage</h1>
        <p className="text-sm text-(--color-muted)">
          Edit the homepage message and visibility without changing code or redeploying.
        </p>
      </div>

      <HomepageSettingsForm settings={settings} />
    </div>
  )
}
