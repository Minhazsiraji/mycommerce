import { sql } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { users } from '@/modules/accounts/schema'

export const fraudBlocks = pgTable(
  'fraud_blocks',
  {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    kind: text('kind').notNull(),
    value: text('value').notNull(),
    reason: text('reason').notNull(),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    revokedAt: timestamp('revoked_at'),
  },
  (t) => [
    uniqueIndex('fraud_blocks_active_value_idx')
      .on(t.kind, t.value)
      .where(sql`${t.revokedAt} is null`),
    index('fraud_blocks_created_idx').on(t.createdAt),
  ],
)

export type FraudBlock = typeof fraudBlocks.$inferSelect
