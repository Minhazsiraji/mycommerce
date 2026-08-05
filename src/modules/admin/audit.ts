import 'server-only'

import { desc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { requireRole } from '@/modules/accounts'

import { auditLogs } from './schema'

/**
 * Records an admin mutation, then returns the acting session.
 *
 * Deliberately combines the authorisation check with the log entry: an action
 * that forgets to audit is an action that also forgot to check the role, which
 * is a much louder bug. One call, hard to half-do.
 *
 * Failures are swallowed. Losing a log line is bad; failing a refund because
 * the log write timed out is worse.
 */
type Entry = {
  action: string
  entityType: string
  entityId?: string | null
  detail?: Record<string, unknown>
}

type Actor = { user: { id: string; email: string } }

export async function auditedAdmin(input: Entry) {
  const session = await requireRole('admin')
  await recordAudit(session, input)
  return session
}

/**
 * Logs against an already-authorised session.
 *
 * Used where the entity id only exists after the mutation has run — creating a
 * product, for instance. Auditing before that point would either miss the id or
 * record actions that never happened.
 */
export async function recordAudit(actor: Actor, input: Entry) {
  try {
    await db.insert(auditLogs).values({
      actorId: actor.user.id,
      actorEmail: actor.user.email,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      detail: input.detail ?? null,
    })
  } catch (error) {
    console.error('[audit] failed to record', input.action, error)
  }
}

export function listAuditLogs(limit = 100) {
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit)
}

export function listAuditLogsFor(entityType: string, entityId: string) {
  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.entityId, entityId))
    .orderBy(desc(auditLogs.createdAt))
}
