'use server'

import { refresh } from 'next/cache'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import { deletePolicyPage, upsertPolicyPage } from './repository'
import { upsertPolicySettings } from './settings-repository'
import {
  POLICY_SLUGS,
  policyPageInputSchema,
  policySettingsInputSchema,
  type PolicySlug,
} from './validators'

export async function savePolicyPage(input: unknown): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')

  const parsed = policyPageInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await upsertPolicyPage(parsed.data)
  await recordAudit(admin, {
    action: 'policy.update',
    entityType: 'policy_page',
    entityId: parsed.data.slug,
  })

  refresh()
  return ok(null)
}

export async function savePolicySettings(input: unknown): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')

  const parsed = policySettingsInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await upsertPolicySettings(parsed.data)
  await recordAudit(admin, {
    action: 'policy.settings.update',
    entityType: 'policy_settings',
    entityId: 'default',
  })

  refresh()
  return ok(null)
}

export async function revertPolicyPage(slug: string): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')

  if (!POLICY_SLUGS.includes(slug as PolicySlug)) {
    return fail('validation', 'Unknown policy page.')
  }

  await deletePolicyPage(slug as PolicySlug)
  await recordAudit(admin, {
    action: 'policy.revert',
    entityType: 'policy_page',
    entityId: slug,
  })

  refresh()
  return ok(null)
}
