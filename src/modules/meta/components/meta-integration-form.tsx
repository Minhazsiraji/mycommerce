'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { saveMetaIntegration, testMetaConnection } from '../integration-actions'

type Props = {
  initial: {
    trackingEnabled: boolean
    pixelId: string
    datasetId: string
    tokenStored: boolean
    testEventCode: string
    domainVerification: string
  }
  status: {
    source: 'admin' | 'env' | 'disabled'
    enabled: boolean
    browserPixelConfigured: boolean
    serverCapiConfigured: boolean
    encryptionReady: boolean
    envFallbackAvailable: boolean
    lastConnectionTestAt: string | null
    lastConnectionStatus: string | null
    lastConnectionMessage: string | null
    lastSuccessfulEventAt: string | null
    lastSuccessfulEventName: string | null
  }
  health: {
    sent: number
    failed: number
    pending: number
    recent: Array<{
      eventName: string
      status: string
      attempts: number
      createdAt: string
      sentAt: string | null
      lastError: string | null
    }>
  }
}

export function MetaIntegrationForm({ initial, status, health }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState({
    ...initial,
    accessToken: '',
    clearAccessToken: false,
  })
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
      const result = await saveMetaIntegration(draft)
      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setMessage(result.error.message)
        return
      }
      setDraft((current) => ({
        ...current,
        accessToken: '',
        clearAccessToken: false,
        tokenStored: current.tokenStored || Boolean(current.accessToken),
      }))
      setMessage('Meta integration settings saved.')
      router.refresh()
    })
  }

  function testConnection() {
    setMessage(undefined)
    startTransition(async () => {
      const result = await testMetaConnection()
      setMessage(result.ok ? result.data.message : result.error.message)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard label="Tracking" value={status.enabled ? 'Active' : 'Off'} detail={`Source: ${status.source}`} />
        <StatusCard label="Browser Pixel" value={status.browserPixelConfigured ? 'Configured' : 'Missing'} detail="Consent-gated browser events" />
        <StatusCard label="Server CAPI" value={status.serverCapiConfigured ? 'Configured' : 'Missing'} detail="Server-side commerce events" />
        <StatusCard label="Secret encryption" value={status.encryptionReady ? 'Ready' : 'Not configured'} detail="AES-256-GCM at rest" />
      </section>

      <section className="rounded-xl border border-(--color-border) p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Meta tracking configuration</h2>
          <p className="mt-1 text-sm text-(--color-muted)">
            Admin values override the existing Vercel fallback. The CAPI token is encrypted server-side and is never shown again after saving.
          </p>
        </div>

        <label className="mb-5 flex items-start justify-between gap-5 rounded-lg border border-(--color-border) p-4">
          <span>
            <span className="block text-sm font-medium">Meta tracking</span>
            <span className="mt-1 block text-xs text-(--color-muted)">Turn Pixel and CAPI tracking on or off for this store.</span>
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
          <Field hint="Numeric Pixel ID from Meta Events Manager">
            <Input
              label="Pixel ID"
              error={errors.pixelId}
              value={draft.pixelId}
              onChange={(event) => set({ pixelId: event.target.value })}
              inputMode="numeric"
              autoComplete="off"
            />
          </Field>
          <Field hint="Numeric Dataset ID used by Conversions API">
            <Input
              label="Dataset ID"
              error={errors.datasetId}
              value={draft.datasetId}
              onChange={(event) => set({ datasetId: event.target.value })}
              inputMode="numeric"
              autoComplete="off"
            />
          </Field>
          <Field hint={draft.tokenStored ? 'A token is stored. Leave blank to keep it.' : 'Stored encrypted; never returned to the browser.'}>
            <Input
              label="CAPI access token"
              error={errors.accessToken}
              type="password"
              value={draft.accessToken}
              placeholder={draft.tokenStored ? '•••••••••••••••• (stored)' : 'Paste token once'}
              onChange={(event) => set({ accessToken: event.target.value, clearAccessToken: false })}
              autoComplete="new-password"
            />
            {draft.tokenStored ? (
              <label className="mt-2 flex items-center gap-2 text-xs text-(--color-muted)">
                <input
                  type="checkbox"
                  checked={draft.clearAccessToken}
                  onChange={(event) => set({ clearAccessToken: event.target.checked, accessToken: '' })}
                />
                Remove the stored token on save
              </label>
            ) : null}
          </Field>
          <Field hint="Optional. Use only while validating events in Meta Test Events.">
            <Input
              label="Test Event Code"
              error={errors.testEventCode}
              value={draft.testEventCode}
              onChange={(event) => set({ testEventCode: event.target.value })}
              autoComplete="off"
            />
          </Field>
          <Field hint="Paste only the content value Meta gives you, not the full <meta> tag.">
            <Input
              label="Domain verification content"
              error={errors.domainVerification}
              value={draft.domainVerification}
              onChange={(event) => set({ domainVerification: event.target.value })}
              autoComplete="off"
            />
          </Field>
        </div>

        {!status.encryptionReady ? (
          <div className="mt-5 rounded-lg border border-amber-300/60 bg-amber-50/50 p-4 text-sm dark:bg-amber-950/20">
            Add the server-only <code>INTEGRATIONS_ENCRYPTION_KEY</code> environment variable before saving a CAPI token. Existing Vercel Meta variables continue to work meanwhile.
          </div>
        ) : null}

        {status.envFallbackAvailable ? (
          <p className="mt-4 text-xs text-(--color-muted)">Existing Vercel Meta configuration is available as a safe fallback.</p>
        ) : null}

        {message ? <p className="mt-4 text-sm" role="status">{message}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={save} disabled={pending}>{pending ? 'Working…' : 'Save settings'}</Button>
          <Button type="button" variant="secondary" onClick={testConnection} disabled={pending || !status.serverCapiConfigured}>Test server connection</Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-(--color-border) p-5">
          <h2 className="font-semibold">Connection health</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <HealthRow label="Last connection test" value={status.lastConnectionTestAt ? `${status.lastConnectionStatus ?? 'unknown'} · ${status.lastConnectionTestAt}` : 'Not tested yet'} />
            <HealthRow label="Test result" value={status.lastConnectionMessage ?? '—'} />
            <HealthRow label="Last successful CAPI event" value={status.lastSuccessfulEventAt ? `${status.lastSuccessfulEventName ?? 'Event'} · ${status.lastSuccessfulEventAt}` : 'No admin-managed health timestamp yet'} />
          </dl>
        </div>
        <div className="rounded-xl border border-(--color-border) p-5">
          <h2 className="font-semibold">Purchase delivery health</h2>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Metric label="Sent" value={health.sent} />
            <Metric label="Pending" value={health.pending} />
            <Metric label="Failed" value={health.failed} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-(--color-border)">
        <div className="border-b border-(--color-border) p-5">
          <h2 className="font-semibold">Recent server Purchase deliveries</h2>
          <p className="mt-1 text-xs text-(--color-muted)">Operational status only. Tokens and customer identifiers are never displayed here.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-2xl text-left text-sm">
            <thead className="bg-(--color-surface) text-xs text-(--color-muted)">
              <tr><th className="px-4 py-3">Event</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Error</th></tr>
            </thead>
            <tbody>
              {health.recent.length ? health.recent.slice(0, 10).map((row, index) => (
                <tr key={`${row.createdAt}-${index}`} className="border-t border-(--color-border)">
                  <td className="px-4 py-3">{row.eventName}</td><td className="px-4 py-3">{row.status}</td><td className="px-4 py-3">{row.attempts}</td><td className="px-4 py-3">{row.createdAt}</td><td className="max-w-xs truncate px-4 py-3 text-(--color-muted)">{row.lastError ?? '—'}</td>
                </tr>
              )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-(--color-muted)">No Purchase delivery records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatusCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-xl border border-(--color-border) p-4"><p className="text-xs text-(--color-muted)">{label}</p><p className="mt-2 font-semibold">{value}</p><p className="mt-1 text-xs text-(--color-muted)">{detail}</p></div>
}
function Field({ hint, children }: { hint: string; children: React.ReactNode }) {
  return <div className="block"><div>{children}</div><p className="mt-1 text-xs text-(--color-muted)">{hint}</p></div>
}
function HealthRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1"><dt className="text-xs text-(--color-muted)">{label}</dt><dd>{value}</dd></div>
}
function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-(--color-surface) p-3"><p className="text-xl font-semibold">{value}</p><p className="text-xs text-(--color-muted)">{label}</p></div>
}
