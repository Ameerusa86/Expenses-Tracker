import { Types } from 'mongoose'
import { Liability, LiabilityDoc } from '@/models/Liability'

export type Strategy = 'avalanche' | 'snowball'

export interface PlannerInput {
  paycheckAmountCents: number
  payDate: Date
  reserveCents?: number
  strategy: Strategy
  userId: string
  targetUtilizationPercent?: number
}

export interface PlannerOutputAllocation {
  liabilityId: Types.ObjectId
  amountCents: number
  dueDate?: Date
}

export interface PlannerOutput {
  allocations: PlannerOutputAllocation[]
  totalAllocatedCents: number
  remainingCents: number
}

function withinUpcomingWindow(
  liability: LiabilityDoc,
  payDate: Date,
): Date | undefined {
  if (liability.type === 'credit-card') {
    if (liability.dueDay) {
      const now = new Date(payDate)
      const due = new Date(now.getFullYear(), now.getMonth(), liability.dueDay)
      // if already passed this month, use next month
      if (due < now) {
        due.setMonth(due.getMonth() + 1)
      }
      return due
    }
  }
  if (liability.nextDueDate) return liability.nextDueDate
  return undefined
}

export async function generateAllocations({
  paycheckAmountCents,
  payDate,
  reserveCents = 0,
  strategy,
  userId,
  targetUtilizationPercent,
}: PlannerInput): Promise<PlannerOutput> {
  const cash = Math.max(0, paycheckAmountCents - reserveCents)
  const openLiabilities = await Liability.find({ userId, status: 'open' })

  // map liabilities with metadata
  type Item = LiabilityDoc & {
    dueDate?: Date
    utilization?: number
  }
  const items: Item[] = openLiabilities.map((l) => {
    const dueDate = withinUpcomingWindow(l, payDate)
    const utilization = l.creditLimitCents
      ? (l.balanceCents / Math.max(1, l.creditLimitCents)) * 100
      : undefined
    return { ...l.toObject(), dueDate, utilization } as Item
  })

  // Sort according to strategy
  const sorted = items.sort((a, b) => {
    if (strategy === 'avalanche') {
      const ai = a.interestRateAPR ?? 0
      const bi = b.interestRateAPR ?? 0
      if (bi !== ai) return bi - ai
      return b.balanceCents - a.balanceCents
    } else {
      // snowball: smallest balance first
      if (a.balanceCents !== b.balanceCents)
        return a.balanceCents - b.balanceCents
      const ai = a.interestRateAPR ?? 0
      const bi = b.interestRateAPR ?? 0
      return bi - ai
    }
  })

  // First ensure minimum payments for any due within the next 21 days
  const now = new Date(payDate)
  const soonWindowDays = 21
  const soonAllocations: PlannerOutputAllocation[] = []
  let remaining = cash

  for (const l of sorted) {
    if (remaining <= 0) break
    const due = l.dueDate
    const isSoon = due
      ? (due.getTime() - now.getTime()) / 86400000 <= soonWindowDays
      : false
    if (
      (isSoon || l.type === 'loan') &&
      l.minPaymentCents &&
      l.balanceCents > 0
    ) {
      const amt = Math.min(l.minPaymentCents, l.balanceCents, remaining)
      if (amt > 0) {
        soonAllocations.push({
          liabilityId: l._id,
          amountCents: amt,
          dueDate: due,
        })
        remaining -= amt
      }
    }
  }

  // Then allocate extra according to strategy to reduce balances
  const extraAllocations: PlannerOutputAllocation[] = []
  for (const l of sorted) {
    if (remaining <= 0) break
    const already =
      soonAllocations.find((a) => a.liabilityId.toString() === l._id.toString())
        ?.amountCents || 0
    const balanceLeft = Math.max(0, l.balanceCents - already)
    if (balanceLeft <= 0) continue

    // Optionally target utilization for credit cards
    let target = balanceLeft
    if (l.type === 'credit-card' && l.creditLimitCents) {
      const goalPct =
        typeof (l as any).targetUtilizationPercent === 'number'
          ? ((l as any).targetUtilizationPercent as number)
          : typeof targetUtilizationPercent === 'number'
            ? targetUtilizationPercent
            : 30
      const targetCents = Math.floor(l.creditLimitCents * (goalPct / 100))
      if (l.balanceCents > targetCents) {
        target = Math.max(
          0,
          Math.min(balanceLeft, l.balanceCents - targetCents),
        )
      }
    }

    const amt = Math.min(target, remaining)
    if (amt > 0) {
      extraAllocations.push({
        liabilityId: l._id,
        amountCents: amt,
        dueDate: l.dueDate,
      })
      remaining -= amt
    }
  }

  const allocations = [...soonAllocations, ...extraAllocations]
  const totalAllocatedCents = allocations.reduce((s, a) => s + a.amountCents, 0)
  return {
    allocations,
    totalAllocatedCents,
    remainingCents: Math.max(0, remaining),
  }
}
