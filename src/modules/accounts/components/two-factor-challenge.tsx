'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { safeRedirect } from '@/lib/safe-redirect'
import { mergeGuestCart } from '@/modules/cart/actions'

import { twoFactor } from '../auth-client'

/**
 * Second step of sign-in. Reached only with a valid challenge cookie — the
 * password has already been accepted and there is still no session.
 */
export function TwoFactorChallenge({ next }: { next?: string | undefined }) {
  const router = useRouter()
  const [mode, setMode] = useState<'totp' | 'backup'>('totp')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function submit() {
    setError(undefined)
    setPending(true)

    try {
      const trimmed = code.trim().replace(/\s+/g, '')

      const { error: authError } =
        mode === 'totp'
          ? await twoFactor.verifyTotp({ code: trimmed })
          : await twoFactor.verifyBackupCode({ code: trimmed })

      if (authError) {
        // The plugin locks the factor after repeated failures; say so rather
        // than letting someone hammer a form that has already stopped listening.
        setError(
          authError.status === 429
            ? 'Too many incorrect codes. Try again in about fifteen minutes.'
            : mode === 'totp'
              ? 'That code is not right. Codes change every 30 seconds — check your clock is accurate.'
              : 'That backup code is not valid, or has already been used.',
        )
        return
      }

      await mergeGuestCart().catch(() => {})

      router.push(safeRedirect(next, '/account') as Route)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Two-step verification</h1>
        <p className="text-sm leading-relaxed text-(--color-muted)">
          {mode === 'totp'
            ? 'Enter the six-digit code from your authenticator app.'
            : 'Enter one of the backup codes you saved when you set this up. Each works once.'}
        </p>
      </div>

      <Input
        label={mode === 'totp' ? 'Authentication code' : 'Backup code'}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        // One-time-code lets a phone offer the code from the notification.
        autoComplete="one-time-code"
        inputMode={mode === 'totp' ? 'numeric' : 'text'}
        autoFocus
        required
        error={error}
      />

      <Button type="submit" disabled={pending || code.trim().length < 6}>
        {pending ? 'Checking…' : 'Verify'}
      </Button>

      <div className="flex justify-between text-sm text-(--color-muted)">
        <button
          type="button"
          className="underline underline-offset-4"
          onClick={() => {
            setMode(mode === 'totp' ? 'backup' : 'totp')
            setCode('')
            setError(undefined)
          }}
        >
          {mode === 'totp' ? 'Use a backup code' : 'Use my authenticator app'}
        </button>

        <Link href="/login" className="underline underline-offset-4">
          Start over
        </Link>
      </div>
    </form>
  )
}
