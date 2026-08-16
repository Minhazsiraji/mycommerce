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

  /**
   * How a customer reaches a human. Shown in the footer, omitted when unset —
   * a store with no way to contact it is one customers do not trust with a card
   * number, and payment gateways commonly ask for this at merchant review.
   */
  STORE_CONTACT_EMAIL: z.email().optional(),
  STORE_CONTACT_PHONE: z.string().trim().max(40).optional(),

  /**
   * Meta Conversions API. Both values are required together; the token never
   * crosses the server boundary. Preview uses its own dataset and may set a
   * Test Events code so validation traffic cannot contaminate Production.
   */
  META_CAPI_DATASET_ID: z.string().trim().min(1).optional(),
  META_CAPI_ACCESS_TOKEN: z.string().trim().min(20).optional(),
  META_CAPI_TEST_EVENT_CODE: z.string().trim().min(1).optional(),
  META_GRAPH_API_VERSION: z
    .string()
    .regex(/^v\d+\.\d+$/)
    .default('v25.0'),

  /**
   * Bank details shown to customers paying by transfer. Env rather than admin
   * because they are set once and changing them is a deliberate, rare act —
   * and a typo here sends money to the wrong account.
   */
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

export const env = load(
  serverSchema,
  process.env,
  'server',
)

/**
 * Referenced explicitly rather than through process.env so Next can inline the
 * value at build time.
 */
export const clientEnv = load(
  clientSchema,
  {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  },
  'client',
)
