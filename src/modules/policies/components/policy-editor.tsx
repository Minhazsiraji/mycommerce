'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { revertPolicyPage, savePolicyPage } from '../actions'
import { POLICY_LABELS, type PolicySlug } from '../validators'

type Existing = { title: string; summary: string; body: string } | null

export function PolicyEditor({ slug, existing }: { slug: PolicySlug; existing: Existing }) {
  const [draft, setDraft] = useState({
    title: existing?.title ?? POLICY_LABELS[slug],
    summary: existing?.summary ?? '',
    body: existing?.body ?? '',
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
      const result = await savePolicyPage({ slug, ...draft })
      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setFormError(result.error.message)
        return
      }
      setSaved(true)
    })
  }

  function revert() {
    startTransition(async () => {
      const result = await revertPolicyPage(slug)
      if (!result.ok) {
        setFormError(result.error.message)
        return
      }
      setDraft({ title: POLICY_LABELS[slug], summary: '', body: '' })
      setSaved(false)
    })
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-(--color-border) p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{POLICY_LABELS[slug]}</h2>
          <p className="mt-1 text-sm text-(--color-muted)">
            {existing
              ? 'Your own text is published on this page.'
              : 'This page is still showing the bundled template. Review it against your own business and jurisdiction before you start selling.'}
          </p>
        </div>
        {existing ? (
          <Button type="button" variant="secondary" onClick={revert} disabled={pending}>
            Use template
          </Button>
        ) : null}
      </div>

      <Input
        label="Page title"
        value={draft.title}
        onChange={(event) => set({ title: event.target.value })}
        error={errors.title}
      />

      <Textarea
        label="Summary"
        rows={2}
        value={draft.summary}
        onChange={(event) => set({ summary: event.target.value })}
        error={errors.summary}
      />

      <Textarea
        label="Policy text"
        rows={14}
        placeholder="Leave a blank line between paragraphs."
        value={draft.body}
        onChange={(event) => set({ body: event.target.value })}
        error={errors.body}
      />

      <p className="text-xs text-(--color-muted)">
        Plain text only. Blank lines separate paragraphs; formatting and links are not interpreted,
        which is what keeps this page safe to publish straight to customers.
      </p>

      {formError ? <p className="text-sm text-(--color-danger)">{formError}</p> : null}
      {saved ? <p className="text-sm text-(--color-success)">Saved and published.</p> : null}

      <div>
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? 'Saving…' : 'Save and publish'}
        </Button>
      </div>
    </section>
  )
}
