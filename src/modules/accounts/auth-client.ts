'use client'

import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    /**
     * No `onTwoFactorRedirect` on purpose.
     *
     * That callback navigates with a hard assignment, which loses the `next`
     * parameter and drops React state on the floor. `AuthForm` inspects
     * `twoFactorRedirect` on the sign-in result and routes there itself, which
     * keeps the redirect target intact.
     */
    twoFactorClient(),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  twoFactor,
} = authClient
