import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'

import { db, schema } from '@/lib/db'
import { env } from '@/lib/env'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/modules/notifications'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

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
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url)
    },
    resetPasswordTokenExpiresIn: 60 * 30,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url)
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

  plugins: [nextCookies()],
})

export type AuthSession = typeof auth.$Infer.Session
