'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatBdt } from '@/lib/money'

import { submitTransferReference } from '../actions'

export function BankTransferInstructions({
  orderNumber,
  amount,
  bank,
}: {
  orderNumber: string
  amount: number
  bank: {
    accountName: string | null
    accountNumber: string | null
    bankName: string | null
    branch: string | null
  }
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)

  const configured = bank.accountName && bank.accountNumber && bank.bankName

  function onSubmit(formData: FormData) {
    setError(undefined)

    startTransition(async () => {
      const result = await submitTransferReference({
        orderNumber,
        reference: String(formData.get('reference') ?? ''),
      })

      if (!result.ok) {
        setError(result.error.message)
        return
      }

      setDone(true)
    })
  }

  if (done) {
    return (
      <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
        <p className="text-sm font-medium">Reference received</p>
        <p className="mt-1 text-sm text-(--color-muted)">
          We will check it against our bank statement and email you once it clears — usually
          within one working day.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-(--color-border) bg-(--color-surface) p-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Send {formatBdt(amount)}</h2>

        {configured ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
            <dt className="text-(--color-muted)">Bank</dt>
            <dd>{bank.bankName}</dd>
            <dt className="text-(--color-muted)">Account name</dt>
            <dd>{bank.accountName}</dd>
            <dt className="text-(--color-muted)">Account number</dt>
            <dd className="font-medium tabular-nums">{bank.accountNumber}</dd>
            {bank.branch ? (
              <>
                <dt className="text-(--color-muted)">Branch</dt>
                <dd>{bank.branch}</dd>
              </>
            ) : null}
            <dt className="text-(--color-muted)">Reference</dt>
            <dd className="font-medium">{orderNumber}</dd>
          </dl>
        ) : (
          <p className="rounded-md bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger)">
            Bank details are not set up yet. Please contact us to complete this order.
          </p>
        )}

        <p className="text-xs text-(--color-muted)">
          Put <span className="font-medium text-(--color-fg)">{orderNumber}</span> in the transfer
          reference so we can match your payment.
        </p>
      </div>

      {configured ? (
        <form action={onSubmit} className="flex flex-col gap-3 border-t border-(--color-border) pt-5">
          <Input
            label="Your transaction reference"
            name="reference"
            placeholder="e.g. TXN123456789"
            required
            error={error}
          />
          <p className="-mt-1 text-xs text-(--color-muted)">
            Send this once the transfer is done. We verify against our statement before
            confirming.
          </p>
          <Button type="submit" disabled={pending} className="self-start">
            {pending ? 'Submitting…' : 'I have sent the payment'}
          </Button>
        </form>
      ) : null}
    </div>
  )
}
