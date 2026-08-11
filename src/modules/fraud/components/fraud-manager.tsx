'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

import { addFraudBlock, revokeFraudBlock } from '../actions'

type Block = {
  id: string
  kind: string
  value: string
  reason: string
  createdAt: Date
  revokedAt: Date | null
}

export function FraudManager({ blocks }: { blocks: Block[] }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()

  function add(formData: FormData) {
    setError(undefined)
    startTransition(async () => {
      const result = await addFraudBlock({
        kind: formData.get('kind'),
        value: formData.get('value'),
        reason: formData.get('reason'),
      })
      if (!result.ok) setError(result.error.message)
    })
  }

  function revoke(id: string) {
    setError(undefined)
    startTransition(async () => {
      const result = await revokeFraudBlock({ id })
      if (!result.ok) setError(result.error.message)
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <form action={add} className="grid gap-4 rounded-lg border border-(--color-border) p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-semibold">Add a block</h2>
          <p className="text-sm text-(--color-muted)">
            Use this only after reviewing suspicious or fake orders. Blocks stop new checkout attempts.
          </p>
        </div>
        <Select label="Block type" name="kind" defaultValue="phone">
          <option value="phone">Phone number</option>
          <option value="email">Email</option>
          <option value="ip">IP address</option>
        </Select>
        <Input label="Value" name="value" required placeholder="01712345678" />
        <div className="sm:col-span-2">
          <Input label="Reason" name="reason" required placeholder="Repeated fake or unpaid orders" />
        </div>
        {error ? <p className="text-sm text-(--color-danger) sm:col-span-2">{error}</p> : null}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? 'Saving…' : 'Block checkout'}
        </Button>
      </form>

      <section>
        <h2 className="font-semibold">Block history</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-(--color-border)">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-(--color-border) text-(--color-muted)">
              <tr><th className="p-3">Type</th><th className="p-3">Value</th><th className="p-3">Reason</th><th className="p-3">Status</th><th className="p-3">Action</th></tr>
            </thead>
            <tbody>
              {blocks.map((block) => (
                <tr key={block.id} className="border-b border-(--color-border) last:border-0">
                  <td className="p-3 capitalize">{block.kind}</td>
                  <td className="p-3 font-mono text-xs">{block.value}</td>
                  <td className="p-3">{block.reason}</td>
                  <td className="p-3">{block.revokedAt ? 'Removed' : 'Active'}</td>
                  <td className="p-3">
                    {!block.revokedAt ? <Button size="sm" variant="secondary" disabled={pending} onClick={() => revoke(block.id)}>Unblock</Button> : '—'}
                  </td>
                </tr>
              ))}
              {blocks.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-(--color-muted)">No blocked values.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
