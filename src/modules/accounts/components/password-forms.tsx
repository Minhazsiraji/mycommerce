'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestPasswordReset, resetPassword } from '../auth-client'
import { emailSchema, passwordSchema } from '../schema'

export function ForgotPasswordForm() {
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(formData: FormData) {
    setError(undefined)
    setPending(true)
    try {
      const parsed = emailSchema.safeParse(formData.get('email'))
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message)
        return
      }

      await requestPasswordReset({ email: parsed.data, redirectTo: '/reset-password' })

      // Always the same outcome, whether or not the address exists — otherwise
      // this form reveals which emails have accounts.
      setDone(true)
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm leading-relaxed text-(--color-muted)">
          If that address has an account, a reset link is on its way. It expires in 30 minutes.
        </p>
        <Link href="/login" className="text-sm underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="text-xl font-semibold">Reset your password</h1>
      <p className="text-sm text-(--color-muted)">
        Enter your email and we will send you a link.
      </p>
      <Input label="Email" name="email" type="email" autoComplete="email" required error={error} />
      <Button type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
      <Link href="/login" className="text-sm text-(--color-muted) underline underline-offset-4">
        Back to sign in
      </Link>
    </form>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setError(undefined)
    setPending(true)
    try {
      const parsed = passwordSchema.safeParse(formData.get('password'))
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message)
        return
      }

      const { error: authError } = await resetPassword({ newPassword: parsed.data, token })
      if (authError) {
        setError('That reset link has expired or already been used. Request a new one.')
        return
      }

      router.push('/login')
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="text-xl font-semibold">Choose a new password</h1>
      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={error}
      />
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save password'}
      </Button>
    </form>
  )
}
