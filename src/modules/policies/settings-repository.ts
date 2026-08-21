import 'server-only'

import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'

import {
  DEFAULT_POLICY_SETTINGS,
  POLICY_SETTINGS_ID,
  type PolicySettingsValues,
} from './settings-defaults'
import { policySettings } from './settings-schema'

export async function getPolicySettings(): Promise<PolicySettingsValues> {
  const row = await db.query.policySettings.findFirst({
    where: eq(policySettings.id, POLICY_SETTINGS_ID),
  })

  if (!row) return { ...DEFAULT_POLICY_SETTINGS }

  return {
    returnWindowDays: row.returnWindowDays,
    refundProcessingMinDays: row.refundProcessingMinDays,
    refundProcessingMaxDays: row.refundProcessingMaxDays,
  }
}

export async function upsertPolicySettings(input: PolicySettingsValues) {
  await db
    .insert(policySettings)
    .values({ id: POLICY_SETTINGS_ID, ...input, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: policySettings.id,
      set: { ...input, updatedAt: new Date() },
    })
}
