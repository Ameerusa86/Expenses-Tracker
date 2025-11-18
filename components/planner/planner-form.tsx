'use client'

import { useActionState, useState, useTransition } from 'react'
import { generatePlan, applyPlan } from '@/app/actions/planner'
import { manualPay } from '@/app/actions/manual-pay'
import { createRecurringIncome } from '@/app/actions/recurring-income'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/utils/money'
import { toast } from 'sonner'

type PlanState = null | {
  planId: string
  allocations: {
    liabilityId: string
    liabilityName?: string | null
    amountCents: number
    dueDate?: string
  }[]
  totalAllocatedCents: number
  remainingCents: number
  payDate: string
}

export default function PlannerForm() {
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [manualRows, setManualRows] = useState<
    Array<{ id: string; name: string; balanceCents: number; amount: string }>
  >([])
  const [manualDate, setManualDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
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
  const [incomeState, incomeAction, incomePending] = useActionState(
    async (_prev: any, formData: FormData) => {
      try {
        const payload = {
          name: String(formData.get('incomeName') || 'Salary'),
          amountCents: Math.round(
            parseFloat(String(formData.get('incomeAmount') || '0') || '0') *
              100,
          ),
          frequency: 'bi-weekly' as const,
          startDate: String(
            formData.get('incomeStartDate') || new Date().toISOString(),
          ),
        }
        const res = await createRecurringIncome(payload)
        toast.success('Recurring income added')
        setShowAddIncome(false)
        // Try filling next paycheck now that income exists
        await useNextPaycheck()
        return res
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to add income'
        toast.error(msg)
        return null
      }
    },
    null as any,
  )

  async function useNextPaycheck() {
    try {
      const res = await fetch('/api/forecast', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load forecast')
      const data = await res.json()
      const next = data?.upcomingPays?.[0]
      if (!next) {
        toast.error('No upcoming paycheck found')
        setShowAddIncome(true)
        return
      }
      const amount = (Number(next.amountCents) || 0) / 100
      const d = new Date(next.date)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const dateStr = `${yyyy}-${mm}-${dd}`

      const amountEl = document.getElementById(
        'paycheckAmount',
      ) as HTMLInputElement | null
      const dateEl = document.getElementById(
        'payDate',
      ) as HTMLInputElement | null
      if (amountEl) amountEl.value = String(amount)
      if (dateEl) dateEl.value = dateStr
      toast.success('Filled next paycheck from forecast')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not fetch forecast'
      toast.error(msg)
    }
  }

  async function toggleManual() {
    if (showManual) {
      setShowManual(false)
      return
    }
    try {
      const res = await fetch('/api/liabilities?limit=200', {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to load liabilities')
      const data = await res.json()
      const rows = (data?.items || []).map((l: any) => ({
        id: String(l._id),
        name: l.name as string,
        balanceCents: Number(l.balanceCents) || 0,
        amount: '',
      }))
      setManualRows(rows)
      setShowManual(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load items'
      toast.error(msg)
    }
  }

  const manualTotal = manualRows.reduce(
    (s, r) => s + (Number(r.amount) || 0),
    0,
  )

  async function applyManual() {
    const items = manualRows
      .map((r) => ({
        id: r.id,
        cents: Math.round((Number(r.amount) || 0) * 100),
      }))
      .filter((i) => i.cents > 0)
    if (items.length === 0) {
      toast.error('Enter at least one amount')
      return
    }
    try {
      const res = await manualPay({
        date: new Date(manualDate),
        items: items.map((i) => ({ liabilityId: i.id, amountCents: i.cents })),
      })
      if (res?.ok) {
        toast.success('Manual payments applied')
        setShowManual(false)
      } else {
        toast.error('Failed to apply')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to apply'
      toast.error(msg)
    }
  }

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
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={useNextPaycheck}>
                Use Next Paycheck
              </Button>
              <Button type="button" variant="outline" onClick={toggleManual}>
                {showManual ? 'Hide Manual' : 'Manual Payments'}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Generating…' : 'Generate Plan'}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {showAddIncome && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">Add Recurring Income</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddIncome(false)}
              disabled={incomePending}
            >
              Close
            </Button>
          </div>
          <form
            action={incomeAction}
            className="grid grid-cols-1 gap-4 md:grid-cols-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="incomeName">Name</Label>
              <Input
                id="incomeName"
                name="incomeName"
                defaultValue="Salary"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="incomeAmount">Amount</Label>
              <Input
                id="incomeAmount"
                name="incomeAmount"
                type="number"
                step="0.01"
                placeholder="e.g. 2500"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="incomeStartDate">Start Date</Label>
              <Input
                id="incomeStartDate"
                name="incomeStartDate"
                type="date"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={incomePending}>
                {incomePending ? 'Adding…' : 'Save Income'}
              </Button>
            </div>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Frequency is bi-weekly. After saving, we’ll auto-fill your next
            paycheck.
          </p>
        </Card>
      )}

      {showManual && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Manual Payments</h3>
            <div className="text-sm text-muted-foreground">
              Total: ${'{'}manualTotal.toFixed(2){'}'}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="manualDate">Payment Date</Label>
              <Input
                id="manualDate"
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 divide-y">
            {manualRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No liabilities found.
              </p>
            ) : (
              manualRows.map((r, idx) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Balance: {formatCurrency(r.balanceCents)}
                    </div>
                  </div>
                  <div className="w-40">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={r.amount}
                      onChange={(e) => {
                        const v = e.target.value
                        setManualRows((rows) =>
                          rows.map((x, i) =>
                            i === idx ? { ...x, amount: v } : x,
                          ),
                        )
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={applyManual}>Apply Manual Payments</Button>
          </div>
        </Card>
      )}

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
                  {a.liabilityName
                    ? a.liabilityName
                    : `Liability • ${a.liabilityId}`}
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
