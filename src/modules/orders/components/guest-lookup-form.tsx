'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { lookupGuestOrder, type LookupState } from '../actions'

const initial: LookupState = {}

export function GuestLookupForm({ defaultOrderNumber }: { defaultOrderNumber?: string }) {
  const [state, formAction, pending] = useActionState(lookupGuestOrder, initial)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="orderNumber"
        label="Order number"
        placeholder="MC-XXXXXX-XXXXXX"
        defaultValue={defaultOrderNumber}
        required
        autoComplete="off"
        spellCheck={false}
        error={state.fieldErrors?.orderNumber}
      />

      <Input
        name="phone"
        type="tel"
        inputMode="tel"
        label="Mobile number"
        placeholder="01636057402"
        required
        autoComplete="tel"
        error={state.fieldErrors?.phone}
      />

      <Button type="submit" disabled={pending}>
        {pending ? 'Looking…' : 'Find my order'}
      </Button>

      {state.error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
