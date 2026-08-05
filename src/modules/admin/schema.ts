import { sql } from 'drizzle-orm'
import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from '@/modules/accounts/schema'

/**
 * Append-only record of every admin mutation.
 *
 * There is no update or delete path in the application — a log an operator can
 * edit answers no question worth asking. Retained one year
 * (docs/04-security.md).
 *
 * With one operator this looks like overhead. It stops looking that way the
 * first time an order is cancelled and nobody remembers doing it, or a second
 * person gets access.
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),

    /** Nulled rather than cascaded: deleting a user must not erase what they did. */
    actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorEmail: text('actor_email').notNull(),

    /** e.g. 'order.cancelled', 'product.updated', 'transfer.confirmed' */
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),

    /** What changed, or the input that caused it. Never credentials. */
    detail: jsonb('detail'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('audit_logs_created_idx').on(t.createdAt),
    index('audit_logs_entity_idx').on(t.entityType, t.entityId),
  ],
)

export type AuditLog = typeof auditLogs.$inferSelect
