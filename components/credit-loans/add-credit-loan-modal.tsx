'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createLiability } from '@/app/actions/liabilities'
import { Loader2, Plus, Landmark, CreditCard, Check } from 'lucide-react'
import { toCents } from '@/utils/money'

const types = [
  { value: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { value: 'loan', label: 'Loan', icon: Landmark },
] as const

export function AddCreditLoanModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState<'credit-card' | 'loan'>(
    'credit-card',
  )
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    type Payload = {
      type: 'credit-card' | 'loan'
      name: string
      institution?: string
      balanceCents: number
      creditLimitCents?: number
      interestRateAPR?: number
      minPaymentCents?: number
      statementDay?: number
      dueDay?: number
      status: 'open' | 'closed'
    }

    const payload: Payload = {
      type: selectedType,
      name: String(data.get('name')),
      institution: String(data.get('institution') || ''),
      balanceCents: toCents(String(data.get('balance') || '0')),
      interestRateAPR: Number(data.get('apr') || 0) || undefined,
      minPaymentCents: data.get('minPayment')
        ? toCents(String(data.get('minPayment')))
        : undefined,
      status: 'open',
    }

    if (selectedType === 'credit-card') {
      payload.creditLimitCents = data.get('creditLimit')
        ? toCents(String(data.get('creditLimit')))
        : undefined
      payload.statementDay = data.get('statementDay')
        ? Number(data.get('statementDay'))
        : undefined
      payload.dueDay = data.get('dueDay')
        ? Number(data.get('dueDay'))
        : undefined
    }

    setIsSubmitting(true)
    try {
      await createLiability(payload)
      toast.success('Credit/Loan added')
      setIsOpen(false)
      router.refresh()
    } catch (e) {
      console.error(e)
      toast.error('Failed to add Credit/Loan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Credit/Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Add Credit/Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {types.map((t) => {
                const Icon = t.icon
                const selected = selectedType === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setSelectedType(t.value)}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-medium">{t.label}</span>
                    </div>
                    {selected && (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Chase Sapphire"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                name="institution"
                placeholder="e.g., Chase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apr">APR %</Label>
              <Input
                id="apr"
                name="apr"
                type="number"
                step="0.01"
                placeholder="e.g., 19.99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPayment">Min Payment</Label>
              <Input
                id="minPayment"
                name="minPayment"
                type="number"
                step="0.01"
                placeholder="e.g., 35.00"
              />
            </div>
          </div>

          {selectedType === 'credit-card' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  name="creditLimit"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statementDay">Statement Day (1-28)</Label>
                <Input
                  id="statementDay"
                  name="statementDay"
                  type="number"
                  min={1}
                  max={28}
                  placeholder="e.g., 15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDay">Due Day (1-28)</Label>
                <Input
                  id="dueDay"
                  name="dueDay"
                  type="number"
                  min={1}
                  max={28}
                  placeholder="e.g., 25"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
