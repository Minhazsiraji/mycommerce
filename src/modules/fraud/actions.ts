'use server'

import { refresh } from 'next/cache'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import * as repo from './repository'
import { fraudBlockSchema, revokeFraudBlockSchema } from './validators'

export async function addFraudBlock(input: unknown): Promise<ActionResult<null>> {
  const parsed = fraudBlockSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  const session = await requireRole('admin')

  const row = await repo.createFraudBlock({ ...parsed.data, createdBy: session.user.id })
  if (!row) return fail('conflict', 'That value is already blocked.')
  await recordAudit(session, {
    action: 'fraud.blocked',
    entityType: 'fraud_identity',
    entityId: row.id,
    detail: { kind: parsed.data.kind, value: parsed.data.value, reason: parsed.data.reason },
  })
  refresh()
  return ok(null)
}

export async function revokeFraudBlock(input: unknown): Promise<ActionResult<null>> {
  const parsed = revokeFraudBlockSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  const session = await requireRole('admin')
  const row = await repo.revokeFraudBlock(parsed.data.id)
  if (!row) return fail('not_found', 'Block not found or already removed.')
  await recordAudit(session, {
    action: 'fraud.unblocked',
    entityType: 'fraud_identity',
    entityId: parsed.data.id,
  })
  refresh()
  return ok(null)
}
