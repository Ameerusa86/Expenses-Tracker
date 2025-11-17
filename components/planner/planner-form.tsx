'use client'

import { useActionState, useTransition } from 'react'
import { generatePlan, applyPlan } from '@/app/actions/planner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/utils/money'
import { toast } from 'sonner'

type PlanState = null | {
  planId: string
  allocations: { liabilityId: string; amountCents: number; dueDate?: string }[]
  totalAllocatedCents: number
  remainingCents: number
  payDate: string
}

export default function PlannerForm() {
  const [state, formAction, pending] = useActionState<PlanState, FormData>(
    async (_prev, formData) => {
      const payload = {
        paycheckAmountCents: Math.round(
          parseFloat(String(formData.get('paycheckAmount') || '0') || '0') *
            100,
        ),
        payDate: String(formData.get('payDate') || new Date().toISOString()),
        reserveCents: Math.round(
          parseFloat(String(formData.get('reserve') || '0') || '0') * 100,
        ),
        strategy: String(formData.get('strategy') || 'avalanche') as
          | 'avalanche'
          | 'snowball',
        targetUtilizationPercent: formData.get('targetUtilization')
          ? Number(formData.get('targetUtilization'))
          : undefined,
      }
      try {
        const res = await generatePlan(payload)
        return res as PlanState
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to generate plan'
        toast.error(msg)
        return null
      }
    },
    null,
  )
  const [isApplying, startApplying] = useTransition()

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-4">
        <form
          action={formAction}
          className="grid grid-cols-1 gap-4 md:grid-cols-5"
        >
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="paycheckAmount">Paycheck Amount</Label>
            <Input
              id="paycheckAmount"
              name="paycheckAmount"
              type="number"
              step="0.01"
              placeholder="e.g. 2500"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="payDate">Pay Date</Label>
            <Input id="payDate" name="payDate" type="date" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reserve">Reserve (optional)</Label>
            <Input
              id="reserve"
              name="reserve"
              type="number"
              step="0.01"
              placeholder="e.g. 200"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="strategy">Strategy</Label>
            <select
              id="strategy"
              name="strategy"
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="avalanche">
                Avalanche (highest interest first)
              </option>
              <option value="snowball">
                Snowball (smallest balance first)
              </option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="targetUtilization">
              Target Utilization % (cards)
            </Label>
            <Input
              id="targetUtilization"
              name="targetUtilization"
              type="number"
              step="1"
              min="0"
              max="100"
              placeholder="30"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending}>
              {pending ? 'Generating…' : 'Generate Plan'}
            </Button>
          </div>
        </form>
      </Card>

      {state && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Suggested Allocations</h3>
            <div className="text-sm text-muted-foreground">
              Total: {formatCurrency(state.totalAllocatedCents)} · Remaining:{' '}
              {formatCurrency(state.remainingCents)}
            </div>
          </div>

          <div className="mt-4 divide-y">
            {state.allocations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No liabilities require payment or insufficient funds.
              </p>
            )}
            {state.allocations.map((a, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="text-muted-foreground">
                  Liability • {a.liabilityId}
                </span>
                <div className="flex items-center gap-4">
                  {a.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      Due {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span className="font-medium">
                    {formatCurrency(a.amountCents)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="default"
              disabled={isApplying || !state.planId}
              onClick={() =>
                startApplying(async () => {
                  try {
                    const res = await applyPlan(state.planId)
                    if (res?.ok) {
                      toast.success('Payments created successfully')
                    } else {
                      toast.error('Failed to apply plan')
                    }
                  } catch (e) {
                    const msg =
                      e instanceof Error ? e.message : 'Failed to apply plan'
                    toast.error(msg)
                  }
                })
              }
            >
              {isApplying ? 'Applying…' : 'Apply Plan (create payments)'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
