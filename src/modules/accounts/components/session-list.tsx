'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'

import { revokeOtherSessions, revokeSession } from '../actions'

export type SessionRow = {
  token: string
  createdAt: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  current: boolean
}

/**
 * Turns a User-Agent into something a person can recognise.
 *
 * Deliberately coarse. The point is "is this me?", and a customer answers that
 * from "Chrome on Windows", not from a version string.
 */
function describe(ua: string | null): string {
  if (!ua) return 'Unknown device'

  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : /Firefox\//.test(ua) ? 'Firefox'
    : 'Browser'

  const os =
    /Windows/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iOS/.test(ua) ? 'iOS'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown OS'

  return `${browser} on ${os}`
}

export function SessionList({ sessions }: { sessions: SessionRow[] }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()

  const others = sessions.filter((s) => !s.current)

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {sessions.map((s) => (
          <li
            key={s.token}
            className="flex items-start justify-between gap-4 rounded-lg border border-(--color-border) p-4 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium">
                {describe(s.userAgent)}
                {s.current ? (
                  <span className="ml-2 rounded-full bg-(--color-accent)/15 px-2 py-0.5 text-xs font-normal text-(--color-accent)">
                    This device
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-(--color-muted)">
                {s.ipAddress ? `${s.ipAddress} · ` : ''}
                signed in {new Date(s.createdAt).toLocaleDateString('en-GB')} · expires{' '}
                {new Date(s.expiresAt).toLocaleDateString('en-GB')}
              </p>
            </div>

            {s.current ? null : (
              <button
                type="button"
                disabled={pending}
                className="shrink-0 text-xs text-(--color-danger) underline underline-offset-4 disabled:opacity-40"
                onClick={() => {
                  setError(undefined)
                  startTransition(async () => {
                    const result = await revokeSession({ token: s.token })
                    if (!result.ok) setError(result.error?.message)
                  })
                }}
              >
                Sign out
              </button>
            )}
          </li>
        ))}
      </ul>

      {others.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          className="self-start text-(--color-danger)"
          disabled={pending}
          onClick={() => {
            setError(undefined)
            startTransition(async () => {
              const result = await revokeOtherSessions()
              if (!result.ok) setError(result.error?.message)
            })
          }}
        >
          {pending ? 'Working…' : `Sign out all ${others.length} other device${others.length === 1 ? '' : 's'}`}
        </Button>
      ) : (
        <p className="text-xs text-(--color-muted)">
          This is the only device signed in to your account.
        </p>
      )}

      {error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </div>
  )
}
