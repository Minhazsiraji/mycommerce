/**
 * Single barrel of every table in the database.
 *
 * Drizzle Kit reads this file to generate migrations, and Better Auth's adapter
 * needs the full schema object. Each module owns its own `schema.ts`; this file
 * only re-exports them.
 */

export * from '@/modules/accounts/schema'
export * from '@/modules/catalog/schema'
export * from '@/modules/cart/schema'
export * from '@/modules/orders/schema'
export * from '@/modules/payments/schema'
export * from '@/modules/inventory/schema'
export * from '@/modules/shipping/schema'
export * from '@/modules/admin/schema'
export * from '@/modules/fraud/schema'
export * from '@/modules/meta/schema'
export * from '@/modules/google/schema'
export * from '@/modules/storefront-settings/schema'

// Infrastructure rather than a domain — see the note in lib/rate-limit.ts.
export { rateLimits } from '@/lib/rate-limit-schema'
