import 'server-only'

import { and, desc, eq, isNull, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'

import { fraudBlocks } from './schema'

export function findActiveBlock(kind: string, value: string) {
  return db.query.fraudBlocks.findFirst({
    where: and(eq(fraudBlocks.kind, kind), eq(fraudBlocks.value, value), isNull(fraudBlocks.revokedAt)),
  })
}

export function listFraudBlocks() {
  return db.select().from(fraudBlocks).orderBy(desc(fraudBlocks.createdAt)).limit(200)
}

export async function createFraudBlock(input: {
  kind: string
  value: string
  reason: string
  createdBy: string
}) {
  const [row] = await db.insert(fraudBlocks).values(input).onConflictDoNothing().returning()
  return row ?? null
}

export async function revokeFraudBlock(id: string) {
  const [row] = await db
    .update(fraudBlocks)
    .set({ revokedAt: new Date() })
    .where(and(eq(fraudBlocks.id, id), isNull(fraudBlocks.revokedAt)))
    .returning()
  return row ?? null
}

export async function countRecentProblemOrders(input: { phone: string; email: string; ip: string }) {
  const result = await db.execute<{ phone_count: number; email_count: number; ip_count: number }>(sql`
    select
      count(*) filter (where phone = ${input.phone})::int as phone_count,
      count(*) filter (where email = ${input.email})::int as email_count,
      count(*) filter (where checkout_ip = ${input.ip})::int as ip_count
    from ${orders}
    where created_at >= now() - interval '7 days'
      and (status = 'cancelled' or payment_status in ('unpaid', 'failed'))
  `)
  return (Array.isArray(result) ? result : result.rows)[0] ?? {
    phone_count: 0,
    email_count: 0,
    ip_count: 0,
  }
}
