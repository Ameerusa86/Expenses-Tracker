'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createLiabilityPayment } from '@/app/actions/liability-payments'
import { createLiabilityCharge } from '@/app/actions/liability-charges'
import { toCents } from '@/utils/money'

type Item = { id: string; name: string }

export function CreditLoansQuickAdd({ items }: { items: Item[] }) {
  const [type, setType] = useState<'payment' | 'charge'>('payment')
  const [liabilityId, setLiabilityId] = useState<string>(items[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  )
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  function reset() {
    setAmount('')
    setNotes('')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!liabilityId) {
      toast.error('Choose a card/loan')
      return
    }
    const cents = toCents(amount || '0')
    if (cents <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    startTransition(async () => {
      try {
        if (type === 'payment') {
          await createLiabilityPayment({
            liabilityId,
            amountCents: cents,
            date: new Date(date),
            notes,
          })
          toast.success('Payment logged')
        } else {
          await createLiabilityCharge({
            liabilityId,
            amountCents: cents,
            date: new Date(date),
            notes,
          })
          toast.success('Charge logged')
        }
        reset()
      } catch (e) {
        toast.error('Failed to save')
      }
    })
  }

  return (
    <Card className="p-4">
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-6 gap-3"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="ql-type">Type</Label>
          <select
            id="ql-type"
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as 'payment' | 'charge')}
          >
            <option value="payment">Payment</option>
            <option value="charge">Charge</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="ql-item">Card/Loan</Label>
          <select
            id="ql-item"
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={liabilityId}
            onChange={(e) => setLiabilityId(e.target.value)}
          >
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ql-amount">Amount</Label>
          <Input
            id="ql-amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ql-date">Date</Label>
          <Input
            id="ql-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="ql-notes">Notes</Label>
          <Input
            id="ql-notes"
            placeholder="Optional note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Add'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
