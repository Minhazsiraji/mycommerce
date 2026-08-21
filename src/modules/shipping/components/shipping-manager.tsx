'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { countryPreset } from '@/lib/country-presets'
import { CURRENCY_SYMBOL, formatBdt, formatBdtPlain } from '@/lib/money'
import { STORE_CONFIG } from '@/lib/store-config'

/** "District" on a Bangladeshi store, "State, province or region" elsewhere. */
const REGION_LABEL = countryPreset(STORE_CONFIG.countryCode).labels.region

import { createShippingRate, deleteShippingRate, updateShippingRate } from '../actions'

export type ManagedRate = {
  id: string
  name: string
  description: string | null
  cost: number
  freeOverSubtotal: number | null
  districts: string[]
  estimatedDaysMin: number
  estimatedDaysMax: number
  position: number
  active: boolean
}

type Draft = {
  name: string
  description: string
  cost: string
  freeOverSubtotal: string
  districts: string
  estimatedDaysMin: string
  estimatedDaysMax: string
  position: string
  active: boolean
}

const blank: Draft = {
  name: '',
  description: '',
  cost: '',
  freeOverSubtotal: '',
  districts: '',
  estimatedDaysMin: '2',
  estimatedDaysMax: '5',
  position: '0',
  active: true,
}

const toDraft = (rate: ManagedRate): Draft => ({
  name: rate.name,
  description: rate.description ?? '',
  cost: formatBdtPlain(rate.cost),
  freeOverSubtotal: rate.freeOverSubtotal == null ? '' : formatBdtPlain(rate.freeOverSubtotal),
  districts: rate.districts.join(', '),
  estimatedDaysMin: String(rate.estimatedDaysMin),
  estimatedDaysMax: String(rate.estimatedDaysMax),
  position: String(rate.position),
  active: rate.active,
})

export function ShippingManager({ rates }: { rates: ManagedRate[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(blank)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [pending, startTransition] = useTransition()

  const hasCatchAll = rates.some((r) => r.districts.length === 0 && r.active)

  function edit(rate: ManagedRate) {
    setEditingId(rate.id)
    setDraft(toDraft(rate))
    setErrors({})
    setFormError(undefined)
  }

  function reset() {
    setEditingId(null)
    setDraft(blank)
    setErrors({})
    setFormError(undefined)
  }

  function save() {
    setErrors({})
    setFormError(undefined)

    startTransition(async () => {
      const input = { ...draft, description: draft.description || undefined }
      const result = editingId
        ? await updateShippingRate(editingId, input)
        : await createShippingRate(input)

      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setFormError(result.error.message)
        return
      }

      reset()
    })
  }

  function remove(rate: ManagedRate) {
    if (!confirm(`Delete "${rate.name}"?`)) return

    setFormError(undefined)
    startTransition(async () => {
      const result = await deleteShippingRate(rate.id)
      if (!result.ok) setFormError(result.error.message)
    })
  }

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div className="flex flex-col gap-8">
      {!hasCatchAll ? (
        <p className="rounded-md bg-(--color-danger)/10 px-4 py-3 text-sm text-(--color-danger)">
          No option covers “everywhere else”. Add one with the coverage field left empty, or
          customers outside your listed areas cannot check out.
        </p>
      ) : null}

      <section className="flex flex-col gap-4 rounded-lg border border-(--color-border) p-5">
        <h2 className="text-sm font-semibold text-(--color-muted)">
          {editingId ? 'Edit delivery option' : 'Add a delivery option'}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            placeholder="Standard delivery"
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            error={errors.name}
          />
          <Input
            label={`Delivery charge (${CURRENCY_SYMBOL})`}
            inputMode="decimal"
            placeholder="60"
            value={draft.cost}
            onChange={(e) => set({ cost: e.target.value })}
            error={errors.cost}
          />
        </div>

        <Input
          label={`${REGION_LABEL}s covered`}
          placeholder={`Leave empty for nationwide delivery, or list ${REGION_LABEL.toLowerCase()}s separated by commas`}
          value={draft.districts}
          onChange={(e) => set({ districts: e.target.value })}
          error={errors.districts}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label={`Free delivery over (${CURRENCY_SYMBOL})`}
            inputMode="decimal"
            placeholder="Optional"
            value={draft.freeOverSubtotal}
            onChange={(e) => set({ freeOverSubtotal: e.target.value })}
            error={errors.freeOverSubtotal}
          />
          <Input
            label="Delivery days, from"
            inputMode="numeric"
            value={draft.estimatedDaysMin}
            onChange={(e) => set({ estimatedDaysMin: e.target.value })}
            error={errors.estimatedDaysMin}
          />
          <Input
            label="Delivery days, to"
            inputMode="numeric"
            value={draft.estimatedDaysMax}
            onChange={(e) => set({ estimatedDaysMax: e.target.value })}
            error={errors.estimatedDaysMax}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => set({ active: e.target.checked })}
          />
          Offer this option at checkout
        </label>

        {formError ? (
          <p role="alert" className="text-sm text-(--color-danger)">
            {formError}
          </p>
        ) : null}

        <div className="flex gap-3">
          <Button type="button" onClick={save} disabled={pending || !draft.name || !draft.cost}>
            {pending ? 'Saving…' : editingId ? 'Save changes' : 'Add option'}
          </Button>
          {editingId ? (
            <Button type="button" variant="ghost" onClick={reset}>
              Cancel
            </Button>
          ) : null}
        </div>
      </section>

      {rates.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--color-border) px-6 py-12 text-center text-sm text-(--color-muted)">
          No delivery options yet. Customers cannot check out until you add one.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-(--color-border)">
          {rates.map((rate) => (
            <li
              key={rate.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-(--color-border) px-4 py-3 text-sm last:border-b-0"
            >
              <div className="flex min-w-0 flex-col">
                <span className="font-medium">
                  {rate.name}
                  {!rate.active ? (
                    <span className="ml-2 text-xs text-(--color-muted)">(hidden)</span>
                  ) : null}
                </span>
                <span className="text-xs text-(--color-muted)">
                  {rate.districts.length ? rate.districts.join(', ') : 'Everywhere else'} ·{' '}

                  {rate.estimatedDaysMin}–{rate.estimatedDaysMax} days
                  {rate.freeOverSubtotal != null
                    ? ` · free over ${formatBdt(rate.freeOverSubtotal)}`
                    : ''}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="tabular-nums">{formatBdt(rate.cost)}</span>
                <button
                  type="button"
                  onClick={() => edit(rate)}
                  className="text-xs underline underline-offset-4"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(rate)}
                  className="text-xs text-(--color-danger) underline underline-offset-4"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
