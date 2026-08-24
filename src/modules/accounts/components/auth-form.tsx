'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { Route } from 'next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { safeRedirect } from '@/lib/safe-redirect'
// From actions.ts, not the module barrel: this is a client component, and the
// barrel also exports server-only reads.
import { mergeGuestCart } from '@/modules/cart/actions'
import { resendVerificationEmail } from '../actions'
import { signIn, signUp } from '../auth-client'
import { loginSchema, registerSchema } from '../validators'

type Mode = 'login' | 'register'
type Errors = Partial<Record<'name' | 'email' | 'password' | 'form', string>>

/**
 * Says nothing about whether the address has an account, or whether that
 * account was already verified. The same sentence for every outcome is the
 * whole point — this form takes an email and needs no password.
 */
export const RESEND_CONFIRMATION =
  "If an account exists and still needs verification, we've sent a new verification email."

export function AuthForm({ mode, next }: { mode: Mode; next?: string | undefined }) {
  const router = useRouter()
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [unverified, setUnverified] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  async function onResend(email: string) {
    setPending(true)
    try {
      // The response is the same whatever happened server-side, so there is
      // nothing here to branch on — and nothing for an onlooker to learn.
      await resendVerificationEmail({ email })
      setResent(true)
    } finally {
      setPending(false)
    }
  }

  async function onSubmit(formData: FormData) {
    setErrors({})
    setPending(true)

    try {
      const raw = Object.fromEntries(formData)
      const schema = mode === 'register' ? registerSchema : loginSchema
      const parsed = schema.safeParse(raw)

      if (!parsed.success) {
        const fieldErrors: Errors = {}
        for (const issue of parsed.error.issues) {
          const key = issue.path[0]
          if (typeof key === 'string' && !(key in fieldErrors)) {
            fieldErrors[key as keyof Errors] = issue.message
          }
        }
        setErrors(fieldErrors)
        return
      }

      if (mode === 'register') {
        const data = parsed.data as { name: string; email: string; password: string }
        const { error } = await signUp.email(data)

        if (error) {
          setErrors({ form: error.message ?? 'Could not create the account.' })
          return
        }
        // Verification is required before sign-in, so there is no session yet.
        setSentTo(data.email)
        return
      }

      const data = parsed.data as { email: string; password: string }
      const { data: result, error } = await signIn.email(data)

      /**
       * The password was right but a second factor is owed.
       *
       * There is no session yet, so the cart merge and the redirect below must
       * not run — Better Auth has issued only a short-lived challenge cookie.
       * `next` is carried across so the customer still lands where they meant
       * to after the code.
       */
      if (result && 'twoFactorRedirect' in result && result.twoFactorRedirect) {
        const query = next ? `?next=${encodeURIComponent(next)}` : ''
        router.push(`/two-factor${query}` as Route)
        return
      }

      if (error) {
        // Deliberately identical for "no such user" and "wrong password" — a
        // distinguishable message turns the login form into an account oracle.
        if (error.status === 403) {
          // 403 means the password was accepted and only verification is owed,
          // so offering a resend here reveals nothing the caller did not prove.
          setUnverified(data.email)
          setErrors({ form: 'Verify your email address before signing in.' })
          return
        }

        setErrors({ form: 'That email and password combination is not correct.' })
        return
      }

      // A guest who filled a cart then signed in must not lose it — that is an
      // abandoned checkout at the last possible step. Failure here is not worth
      // blocking the sign-in over.
      await mergeGuestCart().catch(() => {})

      router.push(safeRedirect(next, '/account') as Route)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm leading-relaxed text-(--color-muted)">
          We sent a verification link to <span className="text-(--color-fg)">{sentTo}</span>. Open it
          to finish setting up your account, then sign in.
        </p>
        {/* The first email can be lost, delayed or refused by the provider. Say
            so here rather than leaving the customer to conclude the account is
            broken. */}
        {resent ? (
          <p className="text-sm text-(--color-success)">{RESEND_CONFIRMATION}</p>
        ) : (
          <p className="text-sm text-(--color-muted)">
            Nothing arrived?{' '}
            <button
              type="button"
              onClick={() => onResend(sentTo)}
              disabled={pending}
              className="underline underline-offset-4 disabled:opacity-60"
            >
              Send it again
            </button>
          </p>
        )}
        <Link href="/login" className="text-sm underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    )
  }

  if (unverified) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Verify your email</h1>
        <p className="text-sm leading-relaxed text-(--color-muted)">
          This account still needs its email address confirmed before you can sign in.
        </p>
        {resent ? (
          <p className="text-sm text-(--color-success)">{RESEND_CONFIRMATION}</p>
        ) : (
          <Button type="button" onClick={() => onResend(unverified)} disabled={pending}>
            {pending ? 'Sending…' : 'Send a new verification email'}
          </Button>
        )}
        <button
          type="button"
          onClick={() => {
            setUnverified(null)
            setResent(false)
            setErrors({})
          }}
          className="text-sm underline underline-offset-4"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="text-xl font-semibold">
        {mode === 'register' ? 'Create an account' : 'Sign in'}
      </h1>

      {mode === 'register' ? (
        <Input label="Name" name="name" autoComplete="name" required error={errors.name} />
      ) : null}

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={errors.email}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        required
        error={errors.password}
      />

      {errors.form ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {errors.form}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
      </Button>

      <div className="flex justify-between text-sm text-(--color-muted)">
        {mode === 'register' ? (
          <Link href="/login" className="underline underline-offset-4">
            Already have an account?
          </Link>
        ) : (
          <>
            <Link href="/register" className="underline underline-offset-4">
              Create an account
            </Link>
            <Link href="/forgot-password" className="underline underline-offset-4">
              Forgot password?
            </Link>
          </>
        )}
      </div>
    </form>
  )
}
