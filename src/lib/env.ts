import { z } from 'zod'

/**
 * Validated at module load. A missing or malformed variable fails the process at
 * boot rather than surfacing as a confusing runtime error inside a request.
 *
 * CI runs typecheck and lint without real secrets, so validation is skippable
 * there — never in dev or production.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),

  /**
   * Overrides DATABASE_URL when set.
   *
   * `DATABASE_URL` is owned by the Vercel–Neon integration on this project. The
   * integration provisions a Neon *branch* of the existing store's project for
   * each preview branch — a copy-on-write clone, complete with that store's
   * products, orders and user accounts — and rewrites the variable on redeploy,
   * so a manually-entered connection string does not survive.
   *
   * A name the integration does not manage is the only reliable way to point a
   * deployment at a genuinely separate database. Unset everywhere else, so
   * production and local development are unaffected.
   */
  APP_DATABASE_URL: z.string().url().optional(),
  BETTER_AUTH_SECRET: z.string().min(32, 'must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('MyCommerce <noreply@example.com>'),
  CRON_SECRET: z.string().min(16).optional(),

  /**
   * Optional deliberately, unlike DATABASE_URL.
   *
   * A missing database means nothing works, so failing at boot is right. A
   * missing image credential only breaks uploads and image rendering — refusing
   * to start the whole site over it would turn a degraded storefront into a
   * total outage. `lib/storage` throws a precise error at point of use instead.
   */
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  /**
   * SSLCommerz. Sandbox and live differ only by these credentials and the host,
   * so the same code path serves both.
   */
  SSLCOMMERZ_STORE_ID: z.string().optional(),
  SSLCOMMERZ_STORE_PASSWORD: z.string().optional(),
  SSLCOMMERZ_SANDBOX: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),

  /** Public business/contact details shown to customers when configured. */
  STORE_CONTACT_EMAIL: z.email().optional(),
  STORE_ADMIN_EMAIL: z.email().optional(),
  STORE_CONTACT_PHONE: z.string().trim().max(40).optional(),
  STORE_BUSINESS_ADDRESS: z.string().trim().max(240).optional(),

  /**
   * Meta environment fallback. Admin-managed settings take precedence once a
   * settings row exists, but these values keep existing SirajiBD tracking live
   * during migration and provide a safe rollback path.
   */
  META_CAPI_DATASET_ID: z.string().trim().min(1).optional(),
  META_CAPI_ACCESS_TOKEN: z.string().trim().min(20).optional(),
  META_CAPI_TEST_EVENT_CODE: z.string().trim().min(1).optional(),
  META_GRAPH_API_VERSION: z
    .string()
    .regex(/^v\d+\.\d+$/)
    .default('v25.0'),

  /**
   * Base64-encoded 32-byte AES key used only to encrypt/decrypt integration
   * secrets stored in Postgres. Optional so env-only Meta tracking continues to
   * work before an operator enables Admin-managed credentials.
   */
  INTEGRATIONS_ENCRYPTION_KEY: z.string().trim().min(43).max(64).optional(),

  /** Bank details shown to customers paying by transfer. */
  BANK_ACCOUNT_NAME: z.string().optional(),
  BANK_ACCOUNT_NUMBER: z.string().optional(),
  BANK_NAME: z.string().optional(),
  BANK_BRANCH: z.string().optional(),
}).superRefine((value, context) => {
  if (Boolean(value.META_CAPI_DATASET_ID) === Boolean(value.META_CAPI_ACCESS_TOKEN)) return

  context.addIssue({
    code: 'custom',
    path: ['META_CAPI_DATASET_ID'],
    message: 'META_CAPI_DATASET_ID and META_CAPI_ACCESS_TOKEN must be set together',
  })
})

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().trim().min(1).optional(),
  /**
   * Optional per-store Google tag fallback. Admin-managed Google settings take
   * precedence once configured; cloned stores should supply their own tag ID.
   */
  NEXT_PUBLIC_GOOGLE_TAG_ID: z
    .string()
    .trim()
    .regex(/^(GT|G|AW)-[A-Z0-9-]+$/i)
    .optional(),
})

const skip = process.env.SKIP_ENV_VALIDATION === 'true'

function load<T extends z.ZodTypeAny>(schema: T, source: unknown, label: string): z.infer<T> {
  if (skip) return {} as z.infer<T>

  const parsed = schema.safeParse(source)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid ${label} environment variables:\n${issues}`)
  }
  return parsed.data
}

export const env = load(serverSchema, process.env, 'server')

/**
 * The one database every part of the application talks to.
 *
 * Runtime, migrations and Drizzle Kit all resolve through this same precedence,
 * because a deployment whose migrations run against one database and whose
 * queries run against another is the failure this exists to prevent — it looks
 * like it worked right up until the data is wrong.
 */
export const databaseUrl = env.APP_DATABASE_URL ?? env.DATABASE_URL

/** Referenced explicitly so Next can inline the public values at build time. */
export const clientEnv = load(
  clientSchema,
  {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    NEXT_PUBLIC_GOOGLE_TAG_ID: process.env.NEXT_PUBLIC_GOOGLE_TAG_ID,
  },
  'client',
)
