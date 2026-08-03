/**
 * Single barrel of every table in the database.
 *
 * Drizzle Kit reads this file to generate migrations, and Better Auth's adapter
 * needs the full schema object. Each module owns its own `schema.ts`; this file
 * only re-exports them.
 */

export * from '@/modules/accounts/schema'
export * from '@/modules/catalog/schema'
