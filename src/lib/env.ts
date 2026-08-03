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
})

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
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
 * Referenced explicitly rather than through process.env so Next can inline the
 * value at build time.
 */
export const clientEnv = load(
  clientSchema,
  { NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL },
  'client',
)
