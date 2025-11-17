import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { RecurringIncome } from '@/models/RecurringIncome'
import { Liability } from '@/models/Liability'
import { biWeeklyOccurrences } from '@/lib/recurrence'

export async function GET() {
  await dbConnect()
  const userId = await getUserId()

  const incomes = await RecurringIncome.find({ userId }).lean()
  const liabilities = await Liability.find({ userId, status: 'open' }).lean()

  const now = new Date()
  const horizonCount = 6

  const pays = incomes.flatMap((inc) => {
    if (inc.frequency !== 'bi-weekly')
      return [] as { date: Date; amountCents: number }[]
    const occ = biWeeklyOccurrences(new Date(inc.startDate), horizonCount, now)
    return occ.map((d) => ({ date: d, amountCents: inc.amountCents }))
  })

  // Group pays by date (if multiple recurring items land same day)
  const byDate = new Map<string, number>()
  for (const p of pays) {
    const key = new Date(
      p.date.getFullYear(),
      p.date.getMonth(),
      p.date.getDate(),
    ).toISOString()
    byDate.set(key, (byDate.get(key) || 0) + p.amountCents)
  }

  const upcomingPays = [...byDate.entries()]
    .map(([k, v]) => ({ date: new Date(k), amountCents: v }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, horizonCount)

  // Compute upcoming min payments within 14 days for context
  const nowMs = now.getTime()
  const horizonMs = 14 * 86400000
  function nextDueDate(l: { nextDueDate?: Date; dueDay?: number }) {
    if (l.nextDueDate) return new Date(l.nextDueDate)
    if (l.dueDay) {
      const d = new Date(now.getFullYear(), now.getMonth(), l.dueDay)
      if (d.getTime() < nowMs) d.setMonth(d.getMonth() + 1)
      return d
    }
    return undefined
  }

  type LeanLiability = {
    _id: unknown
    name: string
    minPaymentCents?: number
    nextDueDate?: Date
    dueDay?: number
  }
  const upcomingPayments = (liabilities as unknown as LeanLiability[])
    .map((l) => ({ ...l, dueDate: nextDueDate(l) }))
    .filter(
      (l) => l.dueDate && (l.dueDate as Date).getTime() - nowMs <= horizonMs,
    )
    .map((l) => ({
      id: String(l._id),
      name: l.name,
      minPaymentCents: l.minPaymentCents ?? 0,
      dueDate: l.dueDate as Date,
    }))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

  return NextResponse.json({ upcomingPays, upcomingPayments })
}
