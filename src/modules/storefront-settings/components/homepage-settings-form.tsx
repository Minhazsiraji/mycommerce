'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { updateStorefrontSettings } from '../actions'
import type { StorefrontSettingsValues } from '../defaults'

type Draft = {
  announcementEnabled: boolean
  announcementDeliveryText: string
  announcementOfferText: string
  heroEnabled: boolean
  heroTitle: string
  heroDescription: string
  heroPrimaryLabel: string
  heroPrimaryHref: string
  heroSecondaryLabel: string
  heroSecondaryHref: string
  heroBrandText: string
  heroBrandAccent: string
  footerBrandText: string
  footerBrandAccent: string
  footerDescription: string
  footerCopyright: string
  logoUrl: string
  faviconUrl: string
}

const toDraft = (settings: StorefrontSettingsValues): Draft => ({
  ...settings,
  announcementDeliveryText: settings.announcementDeliveryText ?? '',
  announcementOfferText: settings.announcementOfferText ?? '',
  logoUrl: settings.logoUrl ?? '',
  faviconUrl: settings.faviconUrl ?? '',
})

function VisibilityToggle({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 rounded-lg border border-(--color-border) p-4">
      <span className="flex flex-col gap-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs leading-5 text-(--color-muted)">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-(--color-accent)"
      />
    </label>
  )
}

export function HomepageSettingsForm({ settings }: { settings: StorefrontSettingsValues }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(settings))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const set = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setSaved(false)
  }

  function save() {
    setErrors({})
    setFormError(undefined)
    setSaved(false)

    startTransition(async () => {
      const result = await updateStorefrontSettings(draft)
      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setFormError(result.error.message)
        return
      }

      setSaved(true)
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-lg border border-(--color-border) p-5">
        <div>
          <h2 className="font-semibold">Announcement bar</h2>
          <p className="mt-1 text-sm text-(--color-muted)">
            Leave either text field empty to keep using the live delivery settings automatically.
          </p>
        </div>

        <VisibilityToggle
          checked={draft.announcementEnabled}
          label="Show announcement bar"
          description="Turns the delivery and offer strip below the header on or off."
          onChange={(announcementEnabled) => set({ announcementEnabled })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Delivery text override"
            placeholder="Automatic: Delivery in 1–5 days"
            value={draft.announcementDeliveryText}
            onChange={(event) => set({ announcementDeliveryText: event.target.value })}
            error={errors.announcementDeliveryText}
          />
          <Input
            label="Offer text override"
            placeholder="Automatic: Free delivery over ৳2,000"
            value={draft.announcementOfferText}
            onChange={(event) => set({ announcementOfferText: event.target.value })}
            error={errors.announcementOfferText}
          />
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-lg border border-(--color-border) p-5">
        <div>
          <h2 className="font-semibold">Hero section</h2>
          <p className="mt-1 text-sm text-(--color-muted)">
            Controls the large introduction at the top of the homepage.
          </p>
        </div>

        <VisibilityToggle
          checked={draft.heroEnabled}
          label="Show hero section"
          description="When hidden, categories and new arrivals move to the top of the homepage."
          onChange={(heroEnabled) => set({ heroEnabled })}
        />

        <Input
          label="Headline"
          value={draft.heroTitle}
          onChange={(event) => set({ heroTitle: event.target.value })}
          error={errors.heroTitle}
        />

        <Textarea
          label="Description"
          rows={3}
          value={draft.heroDescription}
          onChange={(event) => set({ heroDescription: event.target.value })}
          error={errors.heroDescription}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Primary button label"
            value={draft.heroPrimaryLabel}
            onChange={(event) => set({ heroPrimaryLabel: event.target.value })}
            error={errors.heroPrimaryLabel}
          />
          <Input
            label="Primary button destination"
            placeholder="#categories"
            value={draft.heroPrimaryHref}
            onChange={(event) => set({ heroPrimaryHref: event.target.value })}
            error={errors.heroPrimaryHref}
          />
          <Input
            label="Secondary button label"
            value={draft.heroSecondaryLabel}
            onChange={(event) => set({ heroSecondaryLabel: event.target.value })}
            error={errors.heroSecondaryLabel}
          />
          <Input
            label="Secondary button destination"
            placeholder="/search"
            value={draft.heroSecondaryHref}
            onChange={(event) => set({ heroSecondaryHref: event.target.value })}
            error={errors.heroSecondaryHref}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Hero brand text"
            placeholder="Your store"
            value={draft.heroBrandText}
            onChange={(event) => set({ heroBrandText: event.target.value })}
            error={errors.heroBrandText}
          />
          <Input
            label="Highlighted brand text"
            placeholder="Optional"
            value={draft.heroBrandAccent}
            onChange={(event) => set({ heroBrandAccent: event.target.value })}
            error={errors.heroBrandAccent}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Logo image URL (optional)"
            placeholder="Leave empty to use the brand text above"
            value={draft.logoUrl}
            onChange={(event) => set({ logoUrl: event.target.value })}
            error={errors.logoUrl}
          />
          <Input
            label="Site icon URL (optional)"
            placeholder="Leave empty for the default icon"
            value={draft.faviconUrl}
            onChange={(event) => set({ faviconUrl: event.target.value })}
            error={errors.faviconUrl}
          />
        </div>
        <p className="text-xs text-(--color-muted)">
          Upload the image through Products &rarr; media first, then paste its URL here. Only images
          on the store&apos;s own media host are accepted.
        </p>
      </section>

      <section className="flex flex-col gap-5 rounded-lg border border-(--color-border) p-5">
        <div>
          <h2 className="font-semibold">Footer settings</h2>
          <p className="mt-1 text-sm text-(--color-muted)">
            Controls the brand, description and owner credit shown in the storefront footer.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Footer brand text"
            placeholder="Siraji"
            value={draft.footerBrandText}
            onChange={(event) => set({ footerBrandText: event.target.value })}
            error={errors.footerBrandText}
          />
          <Input
            label="Highlighted footer brand text"
            placeholder="BD"
            value={draft.footerBrandAccent}
            onChange={(event) => set({ footerBrandAccent: event.target.value })}
            error={errors.footerBrandAccent}
          />
        </div>

        <Textarea
          label="Footer description"
          rows={3}
          value={draft.footerDescription}
          onChange={(event) => set({ footerDescription: event.target.value })}
          error={errors.footerDescription}
        />

        <Input
          label="Copyright / owner credit"
          placeholder="© @AgentSiraji"
          value={draft.footerCopyright}
          onChange={(event) => set({ footerCopyright: event.target.value })}
          error={errors.footerCopyright}
        />
      </section>

      {formError ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {formError}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">
          Homepage settings saved.
        </p>
      ) : null}

      <div>
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? 'Saving…' : 'Save homepage settings'}
        </Button>
      </div>
    </div>
  )
}
