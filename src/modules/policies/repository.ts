import 'server-only'

import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'

import { policyPages, type PolicyPage } from './schema'
import { POLICY_SLUGS, type PolicySlug, type PolicyPageInput } from './validators'

export async function findPolicyPage(slug: PolicySlug): Promise<PolicyPage | null> {
  const row = await db.query.policyPages.findFirst({ where: eq(policyPages.slug, slug) })
  return row ?? null
}

export async function listPolicyPages(): Promise<Record<string, PolicyPage>> {
  const rows = await db.select().from(policyPages)
  return Object.fromEntries(rows.map((row) => [row.slug, row]))
}

export async function upsertPolicyPage(input: PolicyPageInput) {
  await db
    .insert(policyPages)
    .values({ ...input, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: policyPages.slug,
      set: { title: input.title, summary: input.summary, body: input.body, updatedAt: new Date() },
    })
}

/** Reverts to the bundled template. */
export async function deletePolicyPage(slug: PolicySlug) {
  await db.delete(policyPages).where(eq(policyPages.slug, slug))
}

/**
 * Which pages a client has actually written, versus which are still showing our
 * template. Surfaced in Admin so "we never changed the Terms" is visible rather
 * than discovered by a customer.
 */
export async function policyReviewStatus() {
  const authored = await listPolicyPages()
  return POLICY_SLUGS.map((slug) => ({ slug, authored: Boolean(authored[slug]) }))
}
