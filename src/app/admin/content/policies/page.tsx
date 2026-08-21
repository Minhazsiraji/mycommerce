import type { Metadata } from 'next'
import { connection } from 'next/server'

import { requireRole } from '@/modules/accounts'
import { getPolicySettings, listPolicyPages, POLICY_SLUGS } from '@/modules/policies'
import { PolicyEditor } from '@/modules/policies/components/policy-editor'
import { PolicySettingsForm } from '@/modules/policies/components/policy-settings-form'

export const metadata: Metadata = { title: 'Policy pages' }

export default async function PolicyPagesAdmin() {
  await requireRole('admin')
  await connection()

  const [authored, settings] = await Promise.all([listPolicyPages(), getPolicySettings()])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Policy pages</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--color-muted)">
          Terms, Privacy and Returns describe your business, not this software. The bundled text is
          a starting point written for a different store — replace it with what is actually true for
          yours, and have it checked against the consumer-protection, tax and privacy requirements
          where you sell. Publishing the template unchanged is your decision to make knowingly.
        </p>
      </div>

      <PolicySettingsForm settings={settings} />

      {POLICY_SLUGS.map((slug) => (
        <PolicyEditor
          key={slug}
          slug={slug}
          existing={
            authored[slug]
              ? {
                  title: authored[slug].title,
                  summary: authored[slug].summary,
                  body: authored[slug].body,
                }
              : null
          }
        />
      ))}
    </div>
  )
}
