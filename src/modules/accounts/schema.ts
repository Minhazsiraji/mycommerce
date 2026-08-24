import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

/**
 * Identity tables. Shapes are dictated by Better Auth's Drizzle adapter — field
 * names must match what it expects. Column names are snake_cased automatically by
 * the `casing` option on the db client.
 *
 * `role` is our own addition, declared to Better Auth as an additional field with
 * `input: false` so it can never be set from a request body.
 */

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    role: text('role').notNull().default('customer'),
    /** Owned by Better Auth's two-factor plugin; never set from a request body. */
    twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('users_email_idx').on(t.email)],
)

/**
 * TOTP secrets and backup codes. Shape dictated by the two-factor plugin.
 *
 * Both `secret` and `backupCodes` are encrypted by Better Auth with
 * `BETTER_AUTH_SECRET` before they reach this table, and neither is ever
 * returned by an API response. Rotating that secret invalidates every
 * enrolment — which is the correct behaviour, but means it cannot be rotated
 * casually.
 */
export const twoFactors = pgTable(
  'two_factors',
  {
    id: text('id').primaryKey(),
    secret: text('secret').notNull(),
    backupCodes: text('backup_codes').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    verified: boolean('verified').notNull().default(true),
    /** Drives the plugin's lockout after repeated bad codes. */
    failedVerificationCount: integer('failed_verification_count').notNull().default(0),
    lockedUntil: timestamp('locked_until'),
  },
  (t) => [index('two_factors_user_idx').on(t.userId), index('two_factors_secret_idx').on(t.secret)],
)

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('sessions_token_idx').on(t.token), index('sessions_user_id_idx').on(t.userId)],
)

export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('accounts_user_id_idx').on(t.userId)],
)

export const verifications = pgTable(
  'verifications',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('verifications_identifier_idx').on(t.identifier)],
)

/**
 * Saved delivery addresses.
 *
 * Orders do NOT reference this table — they copy the address in as a JSONB
 * snapshot. Customers edit and delete saved addresses, and a shipped order must
 * not change underneath them. See docs/02-data-model.md decision 5.
 *
 * Fields follow Bangladeshi addressing: house/road, then area, then city and
 * district. Couriers here route on district, so it is required.
 */
export const addresses = pgTable(
  'addresses',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    label: text('label'),
    recipient: text('recipient').notNull(),
    phone: text('phone').notNull(),
    line1: text('line1').notNull(),
    line2: text('line2'),
    city: text('city').notNull(),
    district: text('district').notNull(),
    upazila: text('upazila').notNull().default(''),
    union: text('union'),
    postalCode: text('postal_code'),
    /** No default — the address validator supplies the configured country. */
  country: text('country').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    /** Soft delete, so historical references stay resolvable. */
    archivedAt: timestamp('archived_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('addresses_user_idx').on(t.userId, t.isDefault)],
)

export type Address = typeof addresses.$inferSelect
export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Role = 'customer' | 'admin'
