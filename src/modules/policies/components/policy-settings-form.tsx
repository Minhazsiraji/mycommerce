'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { savePolicySettings } from '../actions'
import type { PolicySettingsValues } from '../settings-defaults'

const asField = (value: number | null) => (value === null ? '' : String(value))

export function PolicySettingsForm({ settings }: { settings: PolicySettingsValues }) {
  const [draft, setDraft] = useState({
    returnWindowDays: asField(settings.returnWindowDays),
    refundProcessingMinDays: asField(settings.refundProcessingMinDays),
    refundProcessingMaxDays: asField(settings.refundProcessingMaxDays),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const set = (patch: Partial<typeof draft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setSaved(false)
  }

  function save() {
    setErrors({})
    setFormError(undefined)

    startTransition(async () => {
      const result = await savePolicySettings(draft)
      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setFormError(result.error.message)
        return
      }
      setSaved(true)
    })
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-(--color-border) p-5">
      <div>
        <h2 className="font-semibold">Return and refund periods</h2>
        <p className="mt-1 text-sm text-(--color-muted)">
          These are your commercial terms, so this software will not guess them. Left empty, the
          Returns page tells customers the period is confirmed when they contact you — vague, but
          true. Fill them in and it states your actual policy.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Return window (days)"
          inputMode="numeric"
          placeholder="Not stated"
          value={draft.returnWindowDays}
          onChange={(event) => set({ returnWindowDays: event.target.value })}
          error={errors.returnWindowDays}
        />
        <Input
          label="Refund takes at least (business days)"
          inputMode="numeric"
          placeholder="Not stated"
          value={draft.refundProcessingMinDays}
          onChange={(event) => set({ refundProcessingMinDays: event.target.value })}
          error={errors.refundProcessingMinDays}
        />
        <Input
          label="Refund takes at most (business days)"
          inputMode="numeric"
          placeholder="Not stated"
          value={draft.refundProcessingMaxDays}
          onChange={(event) => set({ refundProcessingMaxDays: event.target.value })}
          error={errors.refundProcessingMaxDays}
        />
      </div>

      {formError ? <p className="text-sm text-(--color-danger)">{formError}</p> : null}
      {saved ? <p className="text-sm text-(--color-success)">Saved and published.</p> : null}

      <div>
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? 'Saving…' : 'Save periods'}
        </Button>
      </div>
    </section>
  )
}
