'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { saveGoogleIntegration } from '../actions'

type Props = {
  initial: {
    trackingEnabled: boolean
    tagId: string
    purchaseTrackingEnabled: boolean
  }
  status: {
    source: 'admin' | 'env' | 'disabled'
    enabled: boolean
    tagConfigured: boolean
    purchaseTrackingEnabled: boolean
    envFallbackAvailable: boolean
  }
}

export function GoogleIntegrationForm({ initial, status }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string>()
  const [pending, startTransition] = useTransition()

  const set = (patch: Partial<typeof draft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setMessage(undefined)
  }

  function save() {
    setErrors({})
    setMessage(undefined)
    startTransition(async () => {
      const result = await saveGoogleIntegration(draft)
      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setMessage(result.error.message)
        return
      }
      setMessage('Google integration settings saved.')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 sm:grid-cols-3">
        <StatusCard label="Tracking" value={status.enabled ? 'Active' : 'Off'} detail={`Source: ${status.source}`} />
        <StatusCard label="Google tag" value={status.tagConfigured ? 'Configured' : 'Missing'} detail="Consent-gated site-wide tag" />
        <StatusCard label="Purchase event" value={status.purchaseTrackingEnabled ? 'Enabled' : 'Off'} detail="Paid orders only; transaction-id dedupe" />
      </section>

      <section className="rounded-xl border border-(--color-border) p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Google tracking configuration</h2>
          <p className="mt-1 max-w-3xl text-sm text-(--color-muted)">
            Keep Google measurement store-specific. Admin values override the optional Vercel fallback, so a cloned store never needs SirajiBD&apos;s Google destination in source code.
          </p>
        </div>

        <label className="mb-5 flex items-start justify-between gap-5 rounded-lg border border-(--color-border) p-4">
          <span>
            <span className="block text-sm font-medium">Google tracking</span>
            <span className="mt-1 block text-xs text-(--color-muted)">Load the Google tag only after the customer allows analytics.</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={draft.trackingEnabled}
            onChange={(event) => set({ trackingEnabled: event.target.checked })}
            className="mt-1 size-5 accent-(--color-accent)"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Input
              label="Google tag ID"
              error={errors.tagId}
              value={draft.tagId}
              onChange={(event) => set({ tagId: event.target.value })}
              placeholder="GT-XXXX, G-XXXX or AW-XXXX"
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-(--color-muted)">Use the tag ID Google gives this specific store. It is configuration, not a secret.</p>
          </div>

          <label className="flex items-start justify-between gap-5 rounded-lg border border-(--color-border) p-4">
            <span>
              <span className="block text-sm font-medium">Purchase tracking</span>
              <span className="mt-1 block text-xs text-(--color-muted)">Send a Google purchase event only when an order is confirmed paid.</span>
            </span>
            <input
              type="checkbox"
              checked={draft.purchaseTrackingEnabled}
              onChange={(event) => set({ purchaseTrackingEnabled: event.target.checked })}
              className="mt-1 size-5 accent-(--color-accent)"
            />
          </label>
        </div>

        {status.envFallbackAvailable ? (
          <p className="mt-4 text-xs text-(--color-muted)">A Vercel Google tag fallback is available until this store is intentionally moved to Admin-managed settings.</p>
        ) : null}

        {message ? <p className="mt-4 text-sm" role="status">{message}</p> : null}
        <div className="mt-5">
          <Button type="button" onClick={save} disabled={pending}>{pending ? 'Saving…' : 'Save settings'}</Button>
        </div>
      </section>

      <section className="rounded-xl border border-(--color-border) p-5 text-sm">
        <h2 className="font-semibold">Clone safety</h2>
        <p className="mt-2 leading-6 text-(--color-muted)">
          A client clone should use its own Google tag ID. Leaving this integration off sends no Google analytics. The tag respects the storefront analytics consent choice and does not change the existing Meta Pixel/CAPI configuration.
        </p>
      </section>
    </div>
  )
}

function StatusCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-xl border border-(--color-border) p-4"><p className="text-xs text-(--color-muted)">{label}</p><p className="mt-2 font-semibold">{value}</p><p className="mt-1 text-xs text-(--color-muted)">{detail}</p></div>
}
