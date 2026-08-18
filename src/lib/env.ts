import { z } from 'zod'

/** Validated at module load; CI can opt out with SKIP_ENV_VALIDATION. */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32, 'must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('MyCommerce <noreply@example.com>'),
  CRON_SECRET: z.string().min(16).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SSLCOMMERZ_STORE_ID: z.string().optional(),
  SSLCOMMERZ_STORE_PASSWORD: z.string().optional(),
  SSLCOMMERZ_SANDBOX: z.string().optional().transform((v) => v !== 'false'),
  STORE_CONTACT_EMAIL: z.email().optional(),
  STORE_CONTACT_PHONE: z.string().trim().max(40).optional(),

  /** Environment values remain a safe fallback for existing stores. */
  META_CAPI_DATASET_ID: z.string().trim().min(1).optional(),
  META_CAPI_ACCESS_TOKEN: z.string().trim().min(20).optional(),
  META_CAPI_TEST_EVENT_CODE: z.string().trim().min(1).optional(),
  META_GRAPH_API_VERSION: z.string().regex(/^v\d+\.\d+$/).default('v25.0'),

  /**
   * Optional dedicated key for encrypted integration credentials. New clones can
   * set it once; existing stores safely derive a purpose-specific key from the
   * already-required Better Auth secret, so this feature does not force a deploy.
   */
  INTEGRATION_ENCRYPTION_KEY: z.string().min(32).optional(),

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
    const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid ${label} environment variables:\n${issues}`)
  }
  return parsed.data
}

export const env = load(serverSchema, process.env, 'server')

export const clientEnv = load(
  clientSchema,
  {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  },
  'client',
)
