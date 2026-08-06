'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { renderSVG } from 'uqr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { twoFactor } from '../auth-client'

/**
 * TOTP enrolment.
 *
 * Three states, in order, because each one has to complete before the next is
 * safe: prove you own the password, prove your authenticator produces a valid
 * code, then save the backup codes. Enabling on trust is how people lock
 * themselves out with a mis-scanned QR.
 */
type Stage =
  | { name: 'idle' }
  | { name: 'scan'; uri: string; backupCodes: string[] }
  | { name: 'saved'; backupCodes: string[] }

export function TwoFactorSetup({
  enabled,
  required,
}: {
  enabled: boolean
  /** True when an admin was bounced here because admin access demands 2FA. */
  required: boolean
}) {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>({ name: 'idle' })
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  function reset() {
    setStage({ name: 'idle' })
    setPassword('')
    setCode('')
    setError(undefined)
  }

  async function begin() {
    setError(undefined)
    setPending(true)
    try {
      const { data, error: authError } = await twoFactor.enable({ password })

      if (authError || !data) {
        setError(
          authError?.status === 401
            ? 'That password is not correct.'
            : (authError?.message ?? 'Could not start setup.'),
        )
        return
      }

      setStage({ name: 'scan', uri: data.totpURI, backupCodes: data.backupCodes })
      setPassword('')
    } finally {
      setPending(false)
    }
  }

  async function confirm() {
    if (stage.name !== 'scan') return
    setError(undefined)
    setPending(true)
    try {
      const { error: authError } = await twoFactor.verifyTotp({ code: code.trim() })

      if (authError) {
        setError('That code is not right. Codes change every 30 seconds — check your clock.')
        return
      }

      setStage({ name: 'saved', backupCodes: stage.backupCodes })
      setCode('')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  /**
   * Issues a fresh set and discards the old one.
   *
   * Needed for two situations that both end the same way: codes that were never
   * written down, and codes that have been used up. Either leaves an account
   * with a working authenticator and no recovery path, which is fine until the
   * phone breaks.
   */
  async function regenerate() {
    setError(undefined)
    setPending(true)
    try {
      const { data, error: authError } = await twoFactor.generateBackupCodes({ password })

      if (authError || !data) {
        setError(
          authError?.status === 401
            ? 'That password is not correct.'
            : (authError?.message ?? 'Could not generate new codes.'),
        )
        return
      }

      // Reuses the "saved" stage, so the new codes get the same show-once
      // treatment and the same acknowledgement before they disappear.
      setStage({ name: 'saved', backupCodes: data.backupCodes })
      setPassword('')
    } finally {
      setPending(false)
    }
  }

  async function disable() {
    setError(undefined)
    setPending(true)
    try {
      const { error: authError } = await twoFactor.disable({ password })

      if (authError) {
        setError(
          authError.status === 401
            ? 'That password is not correct.'
            : (authError.message ?? 'Could not turn it off.'),
        )
        return
      }

      reset()
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  /* ---------------------------------------------------------------- enabled */

  if (enabled && stage.name !== 'saved') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-(--color-muted)">
          <span className="font-medium text-(--color-fg)">Two-step verification is on.</span> You
          will be asked for a code from your authenticator app each time you sign in.
        </p>

        <details className="text-sm">
          <summary className="cursor-pointer text-(--color-muted) underline underline-offset-4">
            Replace my backup codes
          </summary>

          <div className="mt-3 flex flex-col gap-3">
            <p className="text-xs text-(--color-muted)">
              Use this if you did not save the codes, or have used some up. Generating a new set
              immediately invalidates the old one, so do not do it until you are ready to write the
              new codes down.
            </p>
            <Input
              label="Confirm your password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
            />
            <Button
              type="button"
              className="self-start"
              disabled={pending || !password}
              onClick={() => void regenerate()}
            >
              {pending ? 'Working…' : 'Generate new backup codes'}
            </Button>
          </div>
        </details>

        <details className="text-sm">
          <summary className="cursor-pointer text-(--color-muted) underline underline-offset-4">
            Turn it off
          </summary>

          <div className="mt-3 flex flex-col gap-3">
            <p className="text-xs text-(--color-muted)">
              {required
                ? 'Admin accounts cannot sign in without it — turning it off will lock you out of the admin area until you set it up again.'
                : 'Your account will be protected by your password alone.'}
            </p>
            <Input
              label="Confirm your password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
            />
            <Button
              type="button"
              variant="ghost"
              className="self-start text-(--color-danger)"
              disabled={pending || !password}
              onClick={() => void disable()}
            >
              {pending ? 'Working…' : 'Turn off two-step verification'}
            </Button>
          </div>
        </details>
      </div>
    )
  }

  /* ------------------------------------------------------------ backup done */

  if (stage.name === 'saved') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm">
          <span className="font-medium">Two-step verification is on.</span> Save these backup codes
          somewhere safe — they are the only way in if you lose your phone, and this is the last
          time they are shown. Any codes issued before now have stopped working.
        </p>

        <p className="text-xs text-(--color-muted)">
          Store them somewhere that survives losing the phone holding your authenticator — a
          password manager, or on paper. A screenshot on that same phone is not a backup.
        </p>

        <BackupCodes codes={stage.backupCodes} />

        <Button type="button" className="self-start" onClick={reset}>
          I have saved them
        </Button>
      </div>
    )
  }

  /* ------------------------------------------------------------------ scan */

  if (stage.name === 'scan') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-(--color-muted)">
          Scan this with Google Authenticator, 1Password, Aegis, or any TOTP app, then enter the
          code it shows.
        </p>

        <QrCode uri={stage.uri} />

        <details className="text-sm">
          <summary className="cursor-pointer text-(--color-muted) underline underline-offset-4">
            Can&rsquo;t scan? Enter the key by hand
          </summary>
          <code className="mt-2 block rounded-md border border-(--color-border) bg-(--color-surface) p-3 text-xs break-all">
            {secretFrom(stage.uri)}
          </code>
        </details>

        <Input
          label="Code from your app"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          error={error}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            disabled={pending || code.trim().length < 6}
            onClick={() => void confirm()}
          >
            {pending ? 'Checking…' : 'Confirm and turn on'}
          </Button>
          <Button type="button" variant="ghost" disabled={pending} onClick={reset}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------------ idle */

  return (
    <div className="flex flex-col gap-4">
      {required ? (
        <p className="rounded-lg bg-(--color-danger)/10 px-4 py-3 text-sm text-(--color-danger)">
          Admin access requires two-step verification. Set it up here to reach the admin area.
        </p>
      ) : (
        <p className="text-sm text-(--color-muted)">
          Adds a code from your phone on top of your password, so a stolen password is not enough on
          its own.
        </p>
      )}

      <Input
        label="Confirm your password to begin"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />

      <Button
        type="button"
        className="self-start"
        disabled={pending || !password}
        onClick={() => void begin()}
      >
        {pending ? 'Working…' : 'Set up two-step verification'}
      </Button>
    </div>
  )
}

/**
 * Rendered as an inline SVG rather than an <img>.
 *
 * A data: URI in img-src would work, but inline SVG needs no CSP allowance at
 * all and stays crisp at any size. `uqr` is zero-dependency and pure — hand
 * rolling a QR encoder means a subtly unscannable code, which is worse than a
 * dependency.
 */
function QrCode({ uri }: { uri: string }) {
  const svg = renderSVG(uri, { border: 2 })

  return (
    <div
      className="w-fit rounded-lg bg-white p-3 [&>svg]:h-44 [&>svg]:w-44"
      // Generated from a URI Better Auth just produced, not from user input.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function BackupCodes({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <ul className="grid grid-cols-2 gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) p-4 font-mono text-sm">
        {codes.map((c) => (
          <li key={c} className="tabular-nums">
            {c}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="self-start text-xs text-(--color-muted) underline underline-offset-4"
        onClick={() => {
          void navigator.clipboard.writeText(codes.join('\n')).then(() => setCopied(true))
        }}
      >
        {copied ? 'Copied' : 'Copy all'}
      </button>
    </div>
  )
}

/** Pulls the shared secret out of an otpauth:// URI for manual entry. */
function secretFrom(uri: string): string {
  try {
    return new URL(uri).searchParams.get('secret') ?? uri
  } catch {
    return uri
  }
}
