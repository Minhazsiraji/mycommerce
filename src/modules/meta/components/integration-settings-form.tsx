'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { testMetaIntegration, updateMetaIntegration } from '../integration-actions'

type State = {
  enabled: boolean
  pixelId: string
  datasetId: string
  accessTokenConfigured: boolean
  accessTokenStored: boolean
  testEventCode: string
  domainVerificationCode: string
  source: 'database' | 'environment'
  browserConfigured: boolean
  serverConfigured: boolean
  lastTestStatus: string | null
  lastTestMessage: string | null
  lastTestedAt: string | null
  lastSuccessfulEventName: string | null
  lastSuccessfulEventAt: string | null
  health: { sent: number; failed: number; pending: number; sampleSize: number }
}

function StatusCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-(--color-border) p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-(--color-muted)">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-(--color-muted)">{detail}</p> : null}
    </div>
  )
}

export function MetaIntegrationSettingsForm({ initial }: { initial: State }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [enabled, setEnabled] = useState(initial.enabled)
  const [pixelId, setPixelId] = useState(initial.pixelId)
  const [datasetId, setDatasetId] = useState(initial.datasetId)
  const [accessToken, setAccessToken] = useState('')
  const [clearAccessToken, setClearAccessToken] = useState(false)
  const [testEventCode, setTestEventCode] = useState(initial.testEventCode)
  const [domainVerificationCode, setDomainVerificationCode] = useState(initial.domainVerificationCode)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string>()
  const [messageError, setMessageError] = useState(false)

  function save() {
    setErrors({})
    setMessage(undefined)
    startTransition(async () => {
      const result = await updateMetaIntegration({ enabled, pixelId, datasetId, accessToken, clearAccessToken, testEventCode, domainVerificationCode })
      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setMessage(result.error.message)
        setMessageError(true)
        return
      }
      setAccessToken('')
      setClearAccessToken(false)
      setMessage('Settings saved. New storefront requests use this configuration immediately.')
      setMessageError(false)
      router.refresh()
    })
  }

  function test() {
    setMessage(undefined)
    startTransition(async () => {
      const result = await testMetaIntegration()
      if (!result.ok) {
        setMessage(result.error.message)
        setMessageError(true)
        return
      }
      setMessage(result.data.message)
      setMessageError(false)
      router.refresh()
    })
  }

  const tokenStatus = initial.accessTokenConfigured
    ? initial.accessTokenStored
      ? 'Encrypted in store database'
      : 'Using environment fallback'
    : 'Not configured'

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard label="Meta tracking" value={enabled ? 'On' : 'Off'} detail={`Configuration source: ${initial.source}`} />
        <StatusCard label="Browser Pixel" value={initial.browserConfigured ? 'Configured' : 'Not configured'} detail="Loads only after analytics consent." />
        <StatusCard label="Server CAPI" value={initial.serverConfigured ? 'Configured' : 'Not configured'} detail={tokenStatus} />
        <StatusCard label="Connection" value={initial.lastTestStatus === 'ok' ? 'Connected' : initial.lastTestStatus === 'error' ? 'Needs attention' : 'Not tested'} detail={initial.lastTestedAt ? `Last tested ${initial.lastTestedAt}` : undefined} />
      </div>

      <section className="rounded-lg border border-(--color-border) p-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">Meta tracking configuration</h2>
          <p className="text-sm leading-6 text-(--color-muted)">Configure a cloned store here instead of editing Vercel variables. The CAPI token is encrypted server-side and is never returned to this page.</p>
        </div>

        <label className="mt-5 flex items-start justify-between gap-5 rounded-lg border border-(--color-border) p-4">
          <span>
            <span className="block text-sm font-medium">Meta Tracking</span>
            <span className="mt-1 block text-xs leading-5 text-(--color-muted)">Turn Browser Pixel and server CAPI delivery on or off together.</span>
          </span>
          <input type="checkbox" role="switch" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="mt-1 size-5 accent-(--color-accent)" />
        </label>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Input label="Pixel ID" error={errors.pixelId} value={pixelId} onChange={(event) => setPixelId(event.target.value)} inputMode="numeric" placeholder="Meta Pixel ID" />
          <Input label="CAPI Dataset ID" error={errors.datasetId} value={datasetId} onChange={(event) => setDatasetId(event.target.value)} inputMode="numeric" placeholder="Meta Dataset ID" />
          <div className="md:col-span-2">
            <Input label="CAPI Access Token" error={errors.accessToken} type="password" autoComplete="new-password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder={initial.accessTokenConfigured ? 'Configured — leave blank to keep current token' : 'Paste access token'} />
            <p className="mt-1.5 text-xs text-(--color-muted)">Stored as AES-256-GCM ciphertext. The saved value is never sent back to the browser.</p>
            {initial.accessTokenConfigured ? (
              <label className="mt-2 flex items-center gap-2 text-xs text-(--color-muted)">
                <input type="checkbox" checked={clearAccessToken} onChange={(event) => setClearAccessToken(event.target.checked)} />
                Remove the saved token and fall back to the environment token if one exists
              </label>
            ) : null}
          </div>
          <Input label="Test Event Code (optional, Preview/testing)" value={testEventCode} onChange={(event) => setTestEventCode(event.target.value)} placeholder="TEST12345" />
          <Input label="Domain verification code (optional)" value={domainVerificationCode} onChange={(event) => setDomainVerificationCode(event.target.value)} placeholder="Code only, not the whole meta tag" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={save} disabled={pending}>{pending ? 'Working…' : 'Save Meta settings'}</Button>
          <Button type="button" variant="secondary" onClick={test} disabled={pending || !enabled}>Test connection</Button>
        </div>
        {message ? <p className={`mt-4 text-sm ${messageError ? 'text-red-600' : 'text-emerald-700 dark:text-emerald-400'}`}>{message}</p> : null}
        {initial.lastTestMessage ? <p className="mt-2 text-xs text-(--color-muted)">Last test: {initial.lastTestMessage}</p> : null}
      </section>

      <section className="rounded-lg border border-(--color-border) p-5">
        <h2 className="font-semibold">Event health</h2>
        <p className="mt-1 text-sm text-(--color-muted)">Recent Purchase delivery outbox plus the latest successful browser/server event recorded by the integration.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <StatusCard label="Sent" value={String(initial.health.sent)} />
          <StatusCard label="Failed" value={String(initial.health.failed)} />
          <StatusCard label="Pending" value={String(initial.health.pending)} />
          <StatusCard label="Sample" value={String(initial.health.sampleSize)} />
        </div>
        <p className="mt-4 text-sm text-(--color-muted)">
          Last successful event: <strong className="text-(--color-fg)">{initial.lastSuccessfulEventName ?? 'None recorded yet'}</strong>
          {initial.lastSuccessfulEventAt ? ` · ${initial.lastSuccessfulEventAt}` : ''}
        </p>
      </section>
    </div>
  )
}
