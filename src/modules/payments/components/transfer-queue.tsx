'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CURRENCY_SYMBOL, formatBdt } from '@/lib/money'

import { confirmTransfer, rejectTransfer } from '../actions'

export type PendingTransfer = {
  orderId: string
  orderNumber: string
  email: string
  total: number
  reference: string | null
  submittedAt: Date
}

export function TransferQueue({ transfers }: { transfers: PendingTransfer[] }) {
  if (transfers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-(--color-border) px-6 py-12 text-center text-sm text-(--color-muted)">
        No transfers waiting to be checked.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {transfers.map((transfer) => (
        <TransferRow key={transfer.orderId} transfer={transfer} />
      ))}
    </ul>
  )
}

function TransferRow({ transfer }: { transfer: PendingTransfer }) {
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string>()

  function confirm() {
    setError(undefined)
    startTransition(async () => {
      const result = await confirmTransfer({ orderId: transfer.orderId, observedAmount: amount })
      if (!result.ok) setError(result.error.message)
    })
  }

  function reject() {
    const reason = prompt('Why is this being rejected? The customer will see this.')
    if (!reason) return

    setError(undefined)
    startTransition(async () => {
      const result = await rejectTransfer(transfer.orderId, reason)
      if (!result.ok) setError(result.error.message)
    })
  }

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-(--color-border) p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium tabular-nums">{transfer.orderNumber}</span>
          <span className="text-(--color-muted)">{transfer.email}</span>
          <span className="text-(--color-muted)">
            Reference: <span className="text-(--color-fg)">{transfer.reference ?? '—'}</span>
          </span>
        </div>
        <span className="text-lg font-semibold tabular-nums">{formatBdt(transfer.total)}</span>
      </div>

      {/*
        The admin types what the bank statement shows, and it must match the
        order total. An uploaded receipt would be evidence for a human, never
        proof — a screenshot is trivially forged, so nothing here treats the
        customer's claim as authoritative.
      */}
      <div className="flex flex-wrap items-end gap-3 border-t border-(--color-border) pt-4">
        <div className="w-44">
          <Input
            label={`Amount on statement (${CURRENCY_SYMBOL})`}
            inputMode="decimal"
            placeholder="e.g. 2560"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Button type="button" onClick={confirm} disabled={pending || !amount}>
          {pending ? 'Working…' : 'Confirm payment'}
        </Button>

        <Button type="button" variant="ghost" onClick={reject} disabled={pending}>
          Reject
        </Button>
      </div>

      <p className="-mt-2 text-xs text-(--color-muted)">
        Check your bank statement before confirming. Confirming marks the order paid.
      </p>

      {error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </li>
  )
}
