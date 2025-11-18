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
import { createLiabilityCharge } from '@/app/actions/liability-charges'
import { Loader2, Plus } from 'lucide-react'
import { toCents } from '@/utils/money'

export function AddCreditLoanChargeModal({
  liabilityId,
}: {
  liabilityId: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const payload = {
      liabilityId,
      amountCents: toCents(String(data.get('amount') || '0')),
      date: new Date(
        String(data.get('date') || new Date().toISOString().slice(0, 10)),
      ),
      notes: String(data.get('notes') || ''),
    }

    setIsSubmitting(true)
    try {
      await createLiabilityCharge(payload)
      toast.success('Charge logged')
      setIsOpen(false)
      router.refresh()
    } catch (e) {
      console.error(e)
      toast.error('Failed to log charge')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Charge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add Charge</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Optional note" />
          </div>

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
                  Saving
                </>
              ) : (
                <>Save</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
