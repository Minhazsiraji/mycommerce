import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { twoFactor } from 'better-auth/plugins'

import { db, schema } from '@/lib/db'
import { env } from '@/lib/env'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/modules/notifications'

import { authAllowedHosts } from './auth-hosts'

const allowedHosts = authAllowedHosts({
  canonicalUrl: env.BETTER_AUTH_URL,
  publicUrl: process.env.NEXT_PUBLIC_APP_URL,
  vercelUrl: process.env.VERCEL_URL,
  vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
  vercelProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
})

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  /**
   * Resolve auth against the exact hostname handling this request. A fixed
   * Production URL makes Preview clients call across origins, which the CSP and
   * Better Auth correctly reject. The fallback preserves canonical email links.
   */
  baseURL: {
    allowedHosts,
    protocol: env.NODE_ENV === 'development' ? 'auto' : 'https',
    fallback: env.BETTER_AUTH_URL,
  },

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    usePlural: true,
  }),

  emailAndPassword: {
    enabled: true,
    // No order can be placed from an unverified account — see docs/04-security.md.
    requireEmailVerification: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url)
    },
    resetPasswordTokenExpiresIn: 60 * 30,
    // A password reset is a compromise-recovery path. Keeping stolen sessions
    // alive after the password changes would defeat the reason it exists.
    revokeSessionsOnPasswordReset: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      /**
       * A failed send must not abort the signup: the account is already
       * created, and throwing here leaves the customer with a broken response
       * and no idea an account exists. It is logged instead — without the
       * address or the link — and the customer is offered a resend.
       *
       * The usual cause is a deployment whose EMAIL_FROM domain is not verified
       * with the mail provider, which is silent until someone reads this line.
       */
      await sendVerificationEmail(user.email, url).catch((error) => {
        console.error('[accounts] verification email failed to send at signup', error)
      })
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },

  user: {
    additionalFields: {
      // `input: false` is load-bearing: it stops `role` being accepted from a
      // request body, which would otherwise be trivial privilege escalation.
      role: {
        type: 'string',
        defaultValue: 'customer',
        input: false,
      },
    },
  },

  advanced: {
    cookiePrefix: 'mycommerce',
    useSecureCookies: env.NODE_ENV === 'production',
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'lax',
    },
  },

  // Limits mirror the table in docs/04-security.md.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      '/sign-in/email': { window: 900, max: 5 },
      '/sign-up/email': { window: 900, max: 5 },
      '/forget-password': { window: 3600, max: 3 },
    },
  },

  plugins: [
    /**
     * TOTP second factor.
     *
     * Optional for customers, mandatory for admin — enforced in `guards.ts`
     * rather than here, because Better Auth has no concept of "required for
     * this role". Without that guard the plugin is a setting nobody turns on.
     *
     * `skipVerificationOnEnable` stays false: enrolment is only complete once
     * the user has proved their authenticator produces a working code. Enabling
     * on trust is how people lock themselves out with a mis-scanned QR.
     */
    twoFactor({
      issuer: 'MyCommerce',
      skipVerificationOnEnable: false,
      /**
       * Rate limiting a 6-digit code is not optional — 10 guesses a second
       * exhausts the space in under two days, and a fixed window per IP does
       * not help when the attacker already holds the password. The plugin locks
       * the factor itself after repeated failures.
       */
      accountLockout: {
        enabled: true,
        maxFailedAttempts: 5,
        durationSeconds: 900,
      },
    }),
    // Must stay last: it writes Better Auth's Set-Cookie headers through Next's
    // cookie API, and plugins registered after it would not be covered.
    nextCookies(),
  ],
})

export type AuthSession = typeof auth.$Infer.Session
