'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { setOrderNotes } from '../actions'

/**
 * Free-text notes on an order.
 *
 * The field already holds two things written by the system — whatever the
 * customer typed at checkout, and any cancellation reason appended to it — so
 * this shows them as the starting text rather than an empty box. Editing over a
 * cancellation reason is allowed; the previous text is preserved in the audit
 * log, which is the copy that matters if anyone asks later.
 */
export function OrderNotes({ orderId, notes }: { orderId: string; notes: string | null }) {
  const [value, setValue] = useState(notes ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  const dirty = value !== (notes ?? '')

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-(--color-border) p-5 text-sm">
      <h2 className="text-sm font-semibold">Notes</h2>

      <Textarea
        label="Internal and customer notes"
        rows={4}
        value={value}
        placeholder="Anything worth remembering about this order."
        onChange={(e) => {
          setValue(e.target.value)
          setSaved(false)
        }}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          disabled={pending || !dirty}
          onClick={() => {
            setError(undefined)
            startTransition(async () => {
              const result = await setOrderNotes({ orderId, notes: value })
              if (result.ok) setSaved(true)
              else setError(result.error?.message)
            })
          }}
        >
          {pending ? 'Saving…' : 'Save notes'}
        </Button>

        {saved && !dirty ? (
          <span role="status" className="text-xs text-(--color-muted)">
            Saved
          </span>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </section>
  )
}
