'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { signOut } from '../auth-client'
import { deleteMyAccount, exportMyData } from '../actions'

/** Download a copy of everything, and close the account for good. */
export function AccountDataControls({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col gap-10">
      <ExportSection />
      <DeleteSection isAdmin={isAdmin} />
    </div>
  )
}

function ExportSection() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">Download your data</h2>
        <p className="text-sm text-(--color-muted)">
          A JSON file with your profile, saved addresses and full order history.
        </p>
      </div>

      <Input
        label="Confirm your password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setDone(false)
        }}
        error={error}
      />

      <Button
        type="button"
        className="self-start"
        disabled={pending || !password}
        onClick={() => {
          setError(undefined)
          startTransition(async () => {
            const result = await exportMyData({ password })
            if (!result.ok) {
              setError(result.error?.message)
              return
            }

            /**
             * Built into a blob in the browser rather than served from a route.
             * A URL that returns someone's whole order history is a URL that can
             * be leaked in a referrer, a proxy log or a shared screen; this file
             * never exists anywhere but the tab that asked for it.
             */
            const blob = new Blob([result.data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `mycommerce-data-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)

            setPassword('')
            setDone(true)
          })
        }}
      >
        {pending ? 'Preparing…' : 'Download my data'}
      </Button>

      {done ? (
        <p role="status" className="text-xs text-(--color-muted)">
          Downloaded. Treat the file carefully — it contains your address history.
        </p>
      ) : null}
    </section>
  )
}

function DeleteSection({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  return (
    <section className="flex flex-col gap-3 border-t border-(--color-border) pt-8">
      <div>
        <h2 className="text-sm font-semibold text-(--color-danger)">Delete your account</h2>
        <p className="text-sm text-(--color-muted)">
          Your profile, saved addresses and cart are erased. Past orders are kept as accounting
          records with your name, contact details and street address removed — we cannot delete
          those outright, and we cannot connect what is left back to you.
        </p>
      </div>

      {isAdmin ? (
        <p className="rounded-lg bg-(--color-surface) px-4 py-3 text-sm text-(--color-muted)">
          This is an admin account. Deleting it would leave the store with no one able to manage
          orders, so it has to be done by changing the role first.
        </p>
      ) : !open ? (
        <Button
          type="button"
          variant="ghost"
          className="self-start text-(--color-danger)"
          onClick={() => setOpen(true)}
        >
          Delete my account
        </Button>
      ) : (
        <div className="storefront-card-soft flex flex-col gap-3 border-(--color-danger)/40 p-4">
          <Input
            label="Confirm your password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Typing the word is the pause between meaning it and doing it. */}
          <Input
            label="Type DELETE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            error={error}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              className="bg-(--color-danger) text-white"
              disabled={pending || !password || confirmText !== 'DELETE'}
              onClick={() => {
                setError(undefined)
                startTransition(async () => {
                  const result = await deleteMyAccount({ password })
                  if (!result.ok) {
                    setError(result.error?.message)
                    return
                  }

                  // The session row is already gone with the user; this clears
                  // the cookie so the browser stops sending a dead token.
                  await signOut().catch(() => {})
                  router.push('/')
                  router.refresh()
                })
              }}
            >
              {pending ? 'Deleting…' : 'Permanently delete'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setOpen(false)
                setPassword('')
                setConfirmText('')
                setError(undefined)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
